import { Student, Result, Teacher, GalleryItem, NewsItem, SchoolConfig, AdmissionApplication } from './types';

// Cache for the OAuth access token in-memory
let cachedAccessToken: string | null = null;

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Ensures any cell contents don't crash Google Sheets by staying safely under cell character limits.
 * Truncate massive Base64 strings of uploaded photos to short placeholders.
 */
export function cleanCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // Heavy check for base64 URLs or ultra long strings
  if (str.startsWith('data:image/') || str.length > 3000) {
    return `[BASE64_IMAGE:${str.substring(0, 90)}...]`;
  }
  return str;
}

/**
 * Creates a brand new Google Sheet on user's drive and populates it with tabs & headers.
 * Then sets the sheet permission to public-readable ("Anyone with the link can view").
 */
export async function createAndConfigureSheet(
  accessToken: string,
  students: Student[],
  results: Result[],
  teachers?: Teacher[],
  gallery?: GalleryItem[],
  news?: NewsItem[],
  schoolConfig?: SchoolConfig,
  admissions?: AdmissionApplication[]
): Promise<string> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const body = {
    properties: {
      title: 'Noorul Uloom Madarsa Database - Sheets Sync'
    },
    sheets: [
      {
        properties: {
          title: 'Students'
        }
      },
      {
        properties: {
          title: 'Results'
        }
      },
      {
        properties: {
          title: 'Teachers'
        }
      },
      {
        properties: {
          title: 'Gallery'
        }
      },
      {
        properties: {
          title: 'News'
        }
      },
      {
        properties: {
          title: 'Config'
        }
      },
      {
        properties: {
          title: 'Admissions'
        }
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('Failed to create spreadsheet: ' + err);
  }

  const resultData = await response.json();
  const spreadsheetId = resultData.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error('No spreadsheetId returned from Sheets API');
  }

  // 2. Set the sheet to public-readable using Drive API permissions
  try {
    const permUrl = `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`;
    const permBody = {
      role: 'reader',
      type: 'anyone'
    };
    await fetch(permUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(permBody)
    });
  } catch (err) {
    console.error('Failed to set public permissions. User can still do it manually.', err);
  }

  // 3. Write initial data to the spreadsheet
  await uploadToGoogleSheet(accessToken, spreadsheetId, students, results, teachers, gallery, news, schoolConfig, admissions);

  return spreadsheetId;
}

/**
 * Writes Students, Results, Teachers, Gallery, News, Config, and Admissions datasets to the Google Sheet.
 * Automatically checks and registers missing worksheets dynamically.
 */
export async function uploadToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  students: Student[],
  results: Result[],
  teachers?: Teacher[],
  gallery?: GalleryItem[],
  news?: NewsItem[],
  schoolConfig?: SchoolConfig,
  admissions?: AdmissionApplication[]
): Promise<void> {

  // Gather unique student academic sessions & result cohorts at outer scope
  const studentSessions = Array.from(new Set(students.map(s => String(s.session || '').trim()).filter(Boolean)));
  const resultCombos = Array.from(new Set(results.map(r => `${String(r.session || '').trim()}_${String(r.examType || 'Annual').trim()}`)));

  // 0. Auto-check and create any missing tabs in real time
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
    const metaResponse = await fetch(metaUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (metaResponse.ok) {
      const meta = await metaResponse.json();
      const existingTitles = new Set((meta.sheets || []).map((s: any) => s.properties?.title));
      
      const requiredTitles = ['Students', 'Results', 'Teachers', 'Gallery', 'News', 'Config', 'Admissions'];

      studentSessions.forEach(sess => {
        const title = `St_${sess}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
        if (title && !requiredTitles.includes(title)) {
          requiredTitles.push(title);
        }
      });

      resultCombos.forEach(combo => {
        const [sess, exam] = combo.split('_');
        const title = `Res_${sess}_${exam}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
        if (title && !requiredTitles.includes(title)) {
          requiredTitles.push(title);
        }
      });

      const sheetsToAdd = requiredTitles.filter(t => !existingTitles.has(t));
      
      if (sheetsToAdd.length > 0) {
        const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
        const addRequests = sheetsToAdd.map(title => ({
          addSheet: {
            properties: {
              title: title
            }
          }
        }));
        await fetch(batchUpdateUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: addRequests })
        });
        console.log('Dynamic missing sheets created successfully:', sheetsToAdd);
      }
    }
  } catch (err) {
    console.error('Error auto-creating missing worksheets. Trying write operation fallback anyway.', err);
  }

  // 0.5. Batch Clear previous data to prevent trailing stale data after deletes/edits of children
  try {
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
    const rangesToClear = [
      'Students!A1:K3000',
      'Results!A1:U3000',
      'Teachers!A1:G1000',
      'Gallery!A1:D1000',
      'News!A1:E1500',
      'Config!A1:B1000',
      'Admissions!A1:R3000'
    ];

    studentSessions.forEach(sess => {
      const title = `St_${sess}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
      rangesToClear.push(`${title}!A1:K3000`);
    });

    resultCombos.forEach(combo => {
      const [sess, exam] = combo.split('_');
      const title = `Res_${sess}_${exam}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
      rangesToClear.push(`${title}!A1:U1500`);
    });

    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ranges: rangesToClear })
    });
    console.log('Successfully batch-cleared previous spreadsheet data ranges to prevent stale entries.');
  } catch (clearErr) {
    console.error('Failed to pre-clear database sheets prior to write:', clearErr);
  }

  // Prepare values for Students
  const studentHeaders = [
    'id', 'rollNo', 'name', 'fatherName', 'className', 'session', 'photoUrl', 'dateOfBirth', 'contactNo', 'motherName', 'address'
  ];
  const studentRows = [
    studentHeaders,
    ...students.map(s => [
      cleanCell(s.id),
      cleanCell(s.rollNo),
      cleanCell(s.name),
      cleanCell(s.fatherName),
      cleanCell(s.className),
      cleanCell(s.session),
      cleanCell(s.photoUrl),
      cleanCell(s.dateOfBirth),
      cleanCell(s.contactNo),
      cleanCell(s.motherName),
      cleanCell(s.address)
    ])
  ];

  // Prepare values for Results
  const resultHeaders = [
    'id', 'rollNo', 'className', 'passingYear', 'studentName', 'fatherName', 'photoUrl', 'session', 'marks', 'totalMarks', 'percentage', 'grade', 'isPassed', 'motherName', 'address', 'dateOfBirth', 'regNo', 'udise', 'division', 'rank', 'examType'
  ];
  const resultRows = [
    resultHeaders,
    ...results.map(r => [
      cleanCell(r.id),
      cleanCell(r.rollNo),
      cleanCell(r.className),
      cleanCell(r.passingYear),
      cleanCell(r.studentName),
      cleanCell(r.fatherName),
      cleanCell(r.photoUrl),
      cleanCell(r.session),
      r.marks ? JSON.stringify(r.marks) : '{}',
      cleanCell(r.totalMarks),
      cleanCell(r.percentage),
      cleanCell(r.grade),
      r.isPassed ? 'TRUE' : 'FALSE',
      cleanCell(r.motherName),
      cleanCell(r.address),
      cleanCell(r.dateOfBirth),
      cleanCell(r.regNo),
      cleanCell(r.udise),
      cleanCell(r.division),
      cleanCell(r.rank),
      cleanCell(r.examType)
    ])
  ];

  // Prepare values for Teachers
  const teacherHeaders = ['id', 'name', 'designation', 'qualification', 'photoUrl', 'phone', 'email'];
  const teacherRows = [
    teacherHeaders,
    ...(teachers || []).map(t => [
      cleanCell(t.id),
      cleanCell(t.name),
      cleanCell(t.designation),
      cleanCell(t.qualification),
      cleanCell(t.photoUrl),
      cleanCell(t.phone),
      cleanCell(t.email)
    ])
  ];

  // Prepare values for Gallery
  const galleryHeaders = ['id', 'url', 'caption', 'category'];
  const galleryRows = [
    galleryHeaders,
    ...(gallery || []).map(g => [
      cleanCell(g.id),
      cleanCell(g.url),
      cleanCell(g.caption),
      cleanCell(g.category)
    ])
  ];

  // Prepare values for News
  const newsHeaders = ['id', 'date', 'title', 'content', 'isImportant'];
  const newsRows = [
    newsHeaders,
    ...(news || []).map(n => [
      cleanCell(n.id),
      cleanCell(n.date),
      cleanCell(n.title),
      cleanCell(n.content),
      n.isImportant ? 'TRUE' : 'FALSE'
    ])
  ];

  // Prepare values for Config-key-values
  const configRows = [
    ['key', 'value'],
    ...Object.entries(schoolConfig || {}).map(([key, val]) => [
      cleanCell(key),
      (key === 'qrCodeUrl' || key === 'logoUrl') ? String(val || '') : cleanCell(val)
    ])
  ];

  // Prepare values for Admissions
  const admissionHeaders = [
    'id', 'studentName', 'fatherName', 'motherName', 'dateOfBirth', 'className', 'contactPhone', 'whatsappNumber', 'aadhaarNumber', 'email', 'address', 'gender', 'previousSchool', 'bloodGroup', 'studentPhoto', 'academicYear', 'applyDate', 'status'
  ];
  const admissionRows = [
    admissionHeaders,
    ...(admissions || []).map(a => [
      cleanCell(a.id),
      cleanCell(a.studentName),
      cleanCell(a.fatherName),
      cleanCell(a.motherName),
      cleanCell(a.dateOfBirth),
      cleanCell(a.className),
      cleanCell(a.contactPhone),
      cleanCell(a.whatsappNumber),
      cleanCell(a.aadhaarNumber),
      cleanCell(a.email),
      cleanCell(a.address),
      cleanCell(a.gender),
      cleanCell(a.previousSchool),
      cleanCell(a.bloodGroup),
      cleanCell(a.studentPhoto),
      cleanCell(a.academicYear),
      cleanCell(a.applyDate),
      cleanCell(a.status)
    ])
  ];

  // Perform updates using Sheets API BatchUpdate Values
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  
  const batchData: any[] = [
    {
      range: 'Students!A1:K' + (studentRows.length + 10),
      values: studentRows
    },
    {
      range: 'Results!A1:U' + (resultRows.length + 10),
      values: resultRows
    },
    {
      range: 'Teachers!A1:G' + (teacherRows.length + 10),
      values: teacherRows
    },
    {
      range: 'Gallery!A1:D' + (galleryRows.length + 10),
      values: galleryRows
    },
    {
      range: 'News!A1:E' + (newsRows.length + 10),
      values: newsRows
    },
    {
      range: 'Config!A1:B' + (configRows.length + 10),
      values: configRows
    },
    {
      range: 'Admissions!A1:R' + (admissionRows.length + 10),
      values: admissionRows
    }
  ];

  // Dynamically push student session blocks
  studentSessions.forEach(sess => {
    const filteredSts = students.filter(s => String(s.session || '').trim() === sess);
    const sanitizedTitle = `St_${sess}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
    const rows = [
      studentHeaders,
      ...filteredSts.map(s => [
        cleanCell(s.id),
        cleanCell(s.rollNo),
        cleanCell(s.name),
        cleanCell(s.fatherName),
        cleanCell(s.className),
        cleanCell(s.session),
        cleanCell(s.photoUrl),
        cleanCell(s.dateOfBirth),
        cleanCell(s.contactNo),
        cleanCell(s.motherName),
        cleanCell(s.address)
      ])
    ];
    batchData.push({
      range: `${sanitizedTitle}!A1:K${rows.length + 10}`,
      values: rows
    });
  });

  // Dynamically push result session + examType blocks
  resultCombos.forEach(combo => {
    const [sess, exam] = combo.split('_');
    const filteredRes = results.filter(r => 
      String(r.session || '').trim() === sess &&
      String(r.examType || 'Annual').trim() === exam
    );
    const sanitizedTitle = `Res_${sess}_${exam}`.replace(/[*?\\/\[\]]/g, '').slice(0, 31);
    const rows = [
      resultHeaders,
      ...filteredRes.map(r => [
        cleanCell(r.id),
        cleanCell(r.rollNo),
        cleanCell(r.className),
        cleanCell(r.passingYear),
        cleanCell(r.studentName),
        cleanCell(r.fatherName),
        cleanCell(r.photoUrl),
        cleanCell(r.session),
        r.marks ? JSON.stringify(r.marks) : '{}',
        cleanCell(r.totalMarks),
        cleanCell(r.percentage),
        cleanCell(r.grade),
        r.isPassed ? 'TRUE' : 'FALSE',
        cleanCell(r.motherName),
        cleanCell(r.address),
        cleanCell(r.dateOfBirth),
        cleanCell(r.regNo),
        cleanCell(r.udise),
        cleanCell(r.division),
        cleanCell(r.rank),
        cleanCell(r.examType)
      ])
    ];
    batchData.push({
      range: `${sanitizedTitle}!A1:U${rows.length + 10}`,
      values: rows
    });
  });

  const body = {
    valueInputOption: 'RAW',
    data: batchData
  };

  const response = await fetch(writeUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('Failed to update spreadsheet: ' + err);
  }
}

/**
 * Public function to fetch spreadsheets data cleanly without needing a secret token
 * using Google Visualization API (gv/tq) endpoint for public readable sheets.
 */
export async function fetchFromGoogleSheet(spreadsheetId: string): Promise<{
  students: Student[];
  results: Result[];
  teachers?: Teacher[];
  gallery?: GalleryItem[];
  news?: NewsItem[];
  schoolConfig?: Partial<SchoolConfig>;
  admissions?: AdmissionApplication[];
}> {
  const fetchTab = async (sheetName: string): Promise<any[]> => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tab ${sheetName} from public Google Sheet.`);
    }
    const text = await response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.table || !parsed.table.cols || !parsed.table.rows) {
      return [];
    }

    const cols = parsed.table.cols.map((c: any, index: number) => {
      return c?.label?.trim() || `col_${index}`;
    });

    const items: any[] = [];
    parsed.table.rows.forEach((row: any) => {
      if (!row || !row.c) return;
      const item: any = {};
      row.c.forEach((cell: any, idx: number) => {
        const colName = cols[idx];
        if (colName) {
          item[colName] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
        }
      });
      items.push(item);
    });

    if (items.length > 0 && (items[0].id === 'id' || items[0].key === 'key')) {
      items.shift();
    }

    return items;
  };

  try {
    const rawStudents = await fetchTab('Students');
    const rawResults = await fetchTab('Results');

    const students: Student[] = rawStudents.map(s => ({
      id: String(s.id || ''),
      rollNo: String(s.rollNo || ''),
      name: String(s.name || ''),
      fatherName: String(s.fatherName || ''),
      className: s.className || 'EDADIA',
      session: String(s.session || ''),
      photoUrl: String(s.photoUrl || ''),
      dateOfBirth: String(s.dateOfBirth || ''),
      contactNo: String(s.contactNo || ''),
      motherName: s.motherName ? String(s.motherName) : undefined,
      address: s.address ? String(s.address) : undefined
    }));

    const results: Result[] = rawResults.map(r => {
      let marks = {};
      try {
        if (r.marks && typeof r.marks === 'string' && r.marks.startsWith('{')) {
          marks = JSON.parse(r.marks);
        } else if (r.marks && typeof r.marks === 'object') {
          marks = r.marks;
        }
      } catch (e) {
        console.error('Failed to parse sheet marks column value', r.marks, e);
      }

      return {
        id: String(r.id || ''),
        rollNo: String(r.rollNo || ''),
        className: r.className || 'EDADIA',
        passingYear: Number(r.passingYear) || new Date().getFullYear(),
        studentName: String(r.studentName || ''),
        fatherName: String(r.fatherName || ''),
        photoUrl: String(r.photoUrl || ''),
        session: String(r.session || ''),
        marks,
        totalMarks: Number(r.totalMarks) || 600,
        percentage: Number(r.percentage) || 100,
        grade: r.grade ? String(r.grade) : undefined,
        isPassed: String(r.isPassed).toUpperCase() === 'TRUE',
        motherName: r.motherName ? String(r.motherName) : undefined,
        address: r.address ? String(r.address) : undefined,
        dateOfBirth: r.dateOfBirth ? String(r.dateOfBirth) : undefined,
        regNo: r.regNo ? String(r.regNo) : undefined,
        udise: r.udise ? String(r.udise) : undefined,
        division: r.division ? String(r.division) : undefined,
        rank: r.rank ? String(r.rank) : undefined,
        examType: r.examType ? String(r.examType) : undefined
      };
    });

    const filteredStudents = students.filter(s => s && s.id && s.id.trim() !== '' && s.id !== 'undefined' && s.id !== 'null');
    const filteredResults = results.filter(r => r && r.id && r.id.trim() !== '' && r.id !== 'undefined' && r.id !== 'null');

    // Symmetrical fetching for other tabs so everything propagates cleanly
    let teachers: Teacher[] | undefined = undefined;
    try {
      const rawTeachers = await fetchTab('Teachers');
      teachers = rawTeachers.map(t => ({
        id: String(t.id || ''),
        name: String(t.name || ''),
        designation: String(t.designation || ''),
        qualification: String(t.qualification || ''),
        photoUrl: String(t.photoUrl || ''),
        phone: String(t.phone || ''),
        email: String(t.email || '')
      })).filter(t => t.id && t.id.trim() !== '' && t.id !== 'undefined');
    } catch (e) {
      console.warn('Teachers tab not found or failed to parse from Google Sheet', e);
    }

    let gallery: GalleryItem[] | undefined = undefined;
    try {
      const rawGallery = await fetchTab('Gallery');
      gallery = rawGallery.map(g => ({
        id: String(g.id || ''),
        url: String(g.url || ''),
        caption: String(g.caption || ''),
        category: (g.category || 'Campus') as 'Campus' | 'Events' | 'Classes' | 'Achievements'
      })).filter(g => g.id && g.id.trim() !== '' && g.id !== 'undefined');
    } catch (e) {
      console.warn('Gallery tab not found or failed to parse from Google Sheet', e);
    }

    let news: NewsItem[] | undefined = undefined;
    try {
      const rawNews = await fetchTab('News');
      news = rawNews.map(n => ({
        id: String(n.id || ''),
        date: String(n.date || ''),
        title: String(n.title || ''),
        content: String(n.content || ''),
        isImportant: String(n.isImportant).toUpperCase() === 'TRUE'
      })).filter(n => n.id && n.id.trim() !== '' && n.id !== 'undefined');
    } catch (e) {
      console.warn('News tab not found or failed to parse from Google Sheet', e);
    }

    let schoolConfig: Partial<SchoolConfig> | undefined = undefined;
    try {
      const rawConfig = await fetchTab('Config');
      const parsedConfig: any = {};
      rawConfig.forEach(row => {
        const key = row.key || row.col_0;
        const val = row.value || row.col_1;
        if (key && typeof key === 'string' && key !== 'key' && key.trim() !== '') {
          parsedConfig[key.trim()] = val !== undefined ? String(val).trim() : '';
        }
      });
      if (Object.keys(parsedConfig).length > 0) {
        schoolConfig = parsedConfig;
      }
    } catch (e) {
      console.warn('Config tab not found or failed to parse from Google Sheet', e);
    }

    let admissions: AdmissionApplication[] | undefined = undefined;
    try {
      const rawAdmissions = await fetchTab('Admissions');
      admissions = rawAdmissions.map(a => ({
        id: String(a.id || ''),
        studentName: String(a.studentName || ''),
        fatherName: String(a.fatherName || ''),
        motherName: a.motherName ? String(a.motherName) : undefined,
        dateOfBirth: String(a.dateOfBirth || ''),
        className: a.className || 'EDADIA',
        contactPhone: String(a.contactPhone || ''),
        whatsappNumber: a.whatsappNumber ? String(a.whatsappNumber) : undefined,
        aadhaarNumber: a.aadhaarNumber ? String(a.aadhaarNumber) : undefined,
        email: String(a.email || ''),
        address: String(a.address || ''),
        gender: a.gender ? String(a.gender) as 'Male' | 'Female' | 'Other' : undefined,
        previousSchool: a.previousSchool ? String(a.previousSchool) : undefined,
        bloodGroup: a.bloodGroup ? String(a.bloodGroup) : undefined,
        studentPhoto: a.studentPhoto ? String(a.studentPhoto) : undefined,
        academicYear: a.academicYear ? String(a.academicYear) : undefined,
        applyDate: String(a.applyDate || ''),
        status: (a.status || 'pending') as 'pending' | 'approved' | 'rejected'
      })).filter(a => a.id && a.id.trim() !== '' && a.id !== 'undefined');
    } catch (e) {
      console.warn('Admissions tab not found or failed to parse from Google Sheet', e);
    }

    return {
      students: filteredStudents,
      results: filteredResults,
      teachers,
      gallery,
      news,
      schoolConfig,
      admissions
    };
  } catch (err) {
    console.error('Error fetching/parsing from Google Sheet tab:', err);
    throw err;
  }
}
