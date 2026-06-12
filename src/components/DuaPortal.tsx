import React, { useState, useEffect } from 'react';
import { Search, Book, Sparkles, CheckCircle, Award, Volume2, Bookmark, RefreshCw, ChevronRight, HelpCircle, Trophy, BookOpen, Star, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Dua {
  id: string;
  title: string;
  titleHindi: string;
  category: 'daily' | 'namaz' | 'quranic' | 'protection' | 'ramadan' | 'kids';
  arabic: string;
  transliteration: string;
  translationHindi: string;
  translationUrdu: string;
  benefit: string;
  benefitHindi: string;
}

const DUAS_DATABASE: Dua[] = [
  {
    id: 'dua_1',
    title: 'Before Sleeping (सोने की दुआ)',
    titleHindi: 'सोने से पहले की दुआ',
    category: 'daily',
    arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
    transliteration: 'Allahumma bismika amootu wa ahya',
    translationHindi: 'ए अल्लाह! मैं तेरे नाम के साथ मरता (सोता) हूँ और जीता (उठता) हूँ।',
    translationUrdu: 'اے اللہ! میں تیرے ہی نام کے ساتھ مرتا ہوں اور جیتا ہوں۔',
    benefit: 'Protection from nightmares and peaceful sleep under divine guardianship.',
    benefitHindi: 'सोने से पहले इस दुआ को पढ़ने से बुरे ख्वाबों से हिफाजत होती है।'
  },
  {
    id: 'dua_2',
    title: 'Upon Waking up (सोकर उठने की दुआ)',
    titleHindi: 'सोकर उठने के बाद की दुआ',
    category: 'daily',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-ladhee ahyana ba\'da ma amatana wa ilayhin-nushoor',
    translationHindi: 'सब तारीफें उस अल्लाह के लिए हैं जिसने हमें मारने (सुलाने) के बाद ज़िंदा किया (जगाया) और उसी की तरफ लौट कर जाना है।',
    translationUrdu: 'تمام تعریفیں اس اللہ کے لیے ہیں جس نے ہمیں مارنے کے بعد زندہ کیا اور اسی کی طرف لوٹ کر جانا ہے۔',
    benefit: 'Expressing gratitude for a new day of life and reinforcing faith in Resurrection.',
    benefitHindi: 'सुबह आँख खुलते ही अल्लाह का शुक्र अदा करने के लिए यह दुआ पढ़ें।'
  },
  {
    id: 'dua_3',
    title: 'Before Eating (खाना खाने से पहले की दुआ)',
    titleHindi: 'खाना खाने से पहले की दुआ',
    category: 'daily',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    transliteration: 'Bismillahi wa \'ala barakatillah',
    translationHindi: 'अल्लाह के नाम से और अल्लाह की बरकत पर (हम खाना शुरू करते हैं)।',
    translationUrdu: 'اللہ کے نام سے اور اللہ کی برکت پر مَیں نے کھانا شروع کیا۔',
    benefit: 'Invites blessings (Barakah) into the food and keeps Shaytan away from sharing the meal.',
    benefitHindi: 'भोजन में बरकत और सेहत के लिए इसे खाना खाने से पहले पढ़ें।'
  },
  {
    id: 'dua_4',
    title: 'In case of forgetting Before Eating (शुरू में दुआ भूल जाने पर)',
    titleHindi: 'खाना शुरू करते वक्त दुआ भूल जाने पर',
    category: 'daily',
    arabic: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',
    transliteration: 'Bismillahi awwalahu wa aakhirahu',
    translationHindi: 'अल्लाह के नाम के साथ इसके शुरू में भी और इसके आखिर में भी।',
    translationUrdu: 'شروع اور آخر میں اللہ ہی کے نام سے۔',
    benefit: 'Recovers the lost blessing if the standard starting prayer was forgotten.',
    benefitHindi: 'अगर आप खाना खाने की शुरुआती दुआ भूल जाएं, तो याद आते ही इसे पढ़ें।'
  },
  {
    id: 'dua_5',
    title: 'After Eating (खाना खाने के बाद की दुआ)',
    titleHindi: 'खाना खाने के बाद की दुआ',
    category: 'daily',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: 'Alhamdu lillahil-ladhee at\'amana wa saqana wa ja\'alana muslimeen',
    translationHindi: 'तमाम तारीफें अल्लाह के लिए हैं जिसने हमें खिलाया, पिलाया और हमें मुसलमान बनाया।',
    translationUrdu: 'تمام تعریفیں اس اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور ہمیں مسلمان بنایا۔',
    benefit: 'Gratitude for food, hydration, and the ultimate blessing of being a Muslim.',
    benefitHindi: 'भरपेट खाना और साफ पानी नसीब होने पर रब का शुक्र बजा लाने की दुआ।'
  },
  {
    id: 'dua_6',
    title: 'Before Entering Toilet (बैतुल खला में जाने की दुआ)',
    titleHindi: 'शौचालय में प्रवेश करने की दुआ',
    category: 'daily',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: 'Allahumma innee a\'oodhu bika minal-khubuthi wal-khaba\'ith',
    translationHindi: 'ए अल्लाह! मैं नापाक जिन्नों और जिन्नियों (खबीसों) की शरारत से तेरी पनाह चाहता हूँ।',
    translationUrdu: 'اے اللہ! میں ناپاک جنوں اور جننیوں کے شر سے تیری پناہ چاہتا ہوں۔',
    benefit: 'Divine shield and protection from evil spiritual entities in dirty zones.',
    benefitHindi: 'शौचालय में जाने से पहले बायां पैर आगे रखकर इसे पढ़ें।'
  },
  {
    id: 'dua_7',
    title: 'Leaving toilet (बैतुल खला से निकलने की दुआ)',
    titleHindi: 'शौचालय से बाहर आने की दुआ',
    category: 'daily',
    arabic: 'غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الأَذَى وَعَافَانِي',
    transliteration: 'Ghufranakal-hamdu lillahil-ladhee adh-haba \'annil-adha wa \'aafanee',
    translationHindi: 'ऐ अल्लाह! मैं तुझसे बख़्शिश चाहता हूँ। सब तारीफें उस अल्लाह के लिए हैं जिसने मुझसे तकलीफदेह चीज़ दूर की और मुझे चैन व आफियत दी।',
    translationUrdu: 'اے اللہ! میں تجھ سے بخشش چاہتا ہوں۔ تمام تعریفیں اس اللہ کے لیے ہیں جس نے مجھ سے تکلیف دہ چیز دور کی اور مجھے عافیت دی۔',
    benefit: 'Seeking forgiveness for spiritual shortfall during bathroom stay where Adhkar is prohibited.',
    benefitHindi: 'शौचालय से दायां पैर बाहर निकालकर इसे पढ़ें।'
  },
  {
    id: 'dua_8',
    title: 'For entering the Mosque (मस्जिद में दाखिल होने की दुआ)',
    titleHindi: 'मस्जिद में प्रवेश की दुआ',
    category: 'namaz',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahummaf-tah lee abwaba rahmatik',
    translationHindi: 'ए अल्लाह! मेरे लिए अपनी रहमत के दरवाज़े खोल दे।',
    translationUrdu: 'اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے۔',
    benefit: 'Opens the dynamic gates of Allah\'s unlimited spiritual mercy upon entrance.',
    benefitHindi: 'मस्जिद के अदब के साथ दायां पैर अन्दर रखकर इस दुआ को पढ़ें।'
  },
  {
    id: 'dua_9',
    title: 'For Leaving the Mosque (मस्जिद से निकलने की दुआ)',
    titleHindi: 'मस्जिद से बाहर आने की दुआ',
    category: 'namaz',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma innee as\'aluka min fadlik',
    translationHindi: 'ए अल्लाह! मैं तुझसे तेरे फज़्ल व कर्म की दरख्वास्त करता हूँ।',
    translationUrdu: 'اے اللہ! میں تجھ سے تیرے فضل و کرم کا سوال کرتا ہوں۔',
    benefit: 'Seeking abundance and halal provisions as you return to worldly affairs.',
    benefitHindi: 'मस्जिद से बायां पैर बाहर निकालकर इसे पढ़ना सुन्नत है।'
  },
  {
    id: 'dua_10',
    title: 'Before Wudu (वज़ू शुरू करने की दुआ)',
    titleHindi: 'वज़ू शुरू करते वक्त की दुआ',
    category: 'namaz',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    transliteration: 'Bismillahir-rahmanir-rahim',
    translationHindi: 'अल्लाह के नाम से शुरू जो बहुत मेहरबान, निहायत रहम करने वाला है।',
    translationUrdu: 'اللہ کے نام سے جو بڑا مہربان نہایت رحم فرمانے والا ہے۔',
    benefit: 'Validates and increases the rewards of the purification action.',
    benefitHindi: 'पाक पानी से वज़ू शुरू करते वक्त पाकीज़गी की नीयत से पढ़ें।'
  },
  {
    id: 'dua_11',
    title: 'After Wudu Complete (वज़ू मुकम्मल होने के बाद)',
    titleHindi: 'वज़ू मुकम्मल होने के बाद कलमा व दुआ',
    category: 'namaz',
    arabic: 'أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
    transliteration: 'Ash-hadu an la ilaha illallahu wahdahu la shareeka lahu wa ash-hadu anna Muhammadan \'abduhu wa Rasooluhu. Allahummaj-\'alnee minat-tawwabeena waj-\'alnee minal-mutatahhireen',
    translationHindi: 'मैं गवाही देता हूँ कि अल्लाह के सिवा कोई माबूद नहीं, वह अकेला है, कोई उसका शरीक नहीं, और गवाही देता हूँ कि हज़रत मुहम्मद सल्लल्लाहु अलैहि वसल्लम उसके बंदे और रसूल हैं। ए अल्लाह! मुझे बहुत तौबा करने वालों और बहुत पाकीज़गी अख्तियार करने वालों में शामिल फरमा।',
    translationUrdu: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں وہ اکیلا ہے اس کا کوئی شریک نہیں اور میں گواہی دیتا ہوں کہ محمد (صلی اللہ علیہ وسلم) اس کے بندے اور رسول ہیں۔ اے اللہ! مجھے توبہ کرنے والوں اور پاک صاف رہنے والوں میں شامل فرما۔',
    benefit: 'Prophet Muhammad (PBUH) promised that all 8 gates of Paradise will open for whoever reads this after wudu.',
    benefitHindi: 'वज़ू ख़त्म करके आसमान की तरफ उंगली उठाकर इस ईमानदार गवाही व दुआ को पढ़ें।'
  },
  {
    id: 'dua_12',
    title: 'For Parents (माता-पिता के हक़ में रहम की दुआ)',
    titleHindi: 'माता-पिता (वालिदैन) के लिए रहमत की दुआ',
    category: 'quranic',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbiir-hamhuma kama rabbayanee sagheera',
    translationHindi: 'ए मेरे रब! तू मेरे उन दोनों माता-पिता पर रहम फरमा जैसा कि उन्होंने मेरे बचपन में प्यार व मोहब्बत से मुझे पाला-पोसा है।',
    translationUrdu: 'اے میرے رب! ان دونوں (والدین) پر رحم فرما جس طرح انہوں نے میرے بچپن میں مجھے بالا پوسا۔',
    benefit: 'The best Quranic prayer for children to continuously perform for parents’ health and afterlife.',
    benefitHindi: 'सूरह अल-इसरा की आयत। इसे रोज़ाना पांचों नमाज़ों के बाद पढ़ना बेहद अफ़ज़ल है।'
  },
  {
    id: 'dua_13',
    title: 'For Knowledge Conversion (इल्म व बुद्धि बढ़ाने की दुआ)',
    titleHindi: 'इल्म व याददाश्त बढ़ाने की दुआ',
    category: 'kids',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidnee \'ilma',
    translationHindi: 'ए मेरे परवरदिगार! मेरे ज्ञान (इल्म) में और इज़ाफ़ा (बढ़ोतरी) फ़रमा।',
    translationUrdu: 'اے میرے رب! میرے علم میں اضافہ فرما۔',
    benefit: 'Direct Quranic command to gain sharp memory, true wisdom, and educational excellence.',
    benefitHindi: 'छोटे और बड़े बच्चों को पढ़ाई और इम्तिहान में कामयाबी के लिए इसे बार-बार पढ़ना चाहिए।'
  },
  {
    id: 'dua_14',
    title: 'For Protection from Hell (दोज़ख़ से हिफाज़त की दुआ)',
    titleHindi: 'जहन्नम के अज़ाब से बचने की दुआ (रब्बना)',
    category: 'quranic',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana aatina fid-dunya hasanatan wa fil-aakhirati hasanatan waqina \'adhaban-nar',
    translationHindi: 'ए हमारे परवरदिगार! हमें दुनिया में भी भलाई (नेकी) अता फरमा और आखिरत में भी भलाई अता फरमा और हमें जहन्नम (आग) के कठोर अज़ाब से बचा।',
    translationUrdu: 'اے ہمارے پروردگار! ہمیں دنیا میں بھی بھلائی عطا فرما اور آخرت میں بھی بھلائی عطا فرما اور ہمیں دوزخ کے عذاب سے بچا ۔',
    benefit: 'The most comprehensive prayer of Quran, encapsulating goodness in both worlds completely.',
    benefitHindi: 'कुरान पाक की सूरह बकराह की मशहूर दुआ जो दुनिया-आख़िरत की बेहतरीन कामयाबी मांगती है।'
  },
  {
    id: 'dua_15',
    title: 'Easy Ramadan Iftar Dua (इफ़्तार के वक्त की दुआ)',
    titleHindi: 'रोज़ा इफ़्तार (खोलने) की दुआ',
    category: 'ramadan',
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma innee laka sumtu wa bika aamantu wa \'alayka tawakkaltu wa \'ala rizqika aftartu',
    translationHindi: 'ए अल्लाह! मैंने तेरे ही लिए रोज़ा रखा, और तुझ पर ही ईमान लाया, और तुझ पर ही भरोसा किया, और तेरे ही दिए हुए रिज़्क से इफ़्तार किया।',
    translationUrdu: 'اے اللہ! میں نے تیرے ہی لیے روزہ رکھا، اور تجھ پر ایمان لایا، اور تجھ پر ہی بھروسہ کیا، اور تیرے ہی دیے ہوئے رزق سے افطار کیا۔',
    benefit: 'Acceptance of the rigorous fast at the crucial split-second of breaking it.',
    benefitHindi: 'रमज़ान मुबारक में खजूर या पानी से रोज़ा खोलते समय इस दुआ को पढ़ें।'
  },
  {
    id: 'dua_16',
    title: 'For Protection from Evil Eye & Harm (हर नुकसान से हिफ़ाज़त की दुआ)',
    titleHindi: 'बुरी नज़र, जादू और हर बीमारी से हिफ़ाज़त की दुआ',
    category: 'protection',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladhee la yadurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa Huwas-Sami\'ul-\'Aleem',
    translationHindi: 'अल्लाह के नाम के साथ, जिसके नाम की बरकत से ज़मीन और आसमान की कोई भी चीज़ नुकसान नहीं पहुँचा सकती, और वह सब कुछ सुनने वाला और जानने वाला है।',
    translationUrdu: 'اللہ کے نام سے جس کے نام کی برکت سے زمین اور آسمان کی کوئی چیز نقصان نہیں پہنچا سکتی اور وہ سننے والا اور جاننے والا ہے۔',
    benefit: 'Prophetic shield against sudden calamities, accidents, viral diseases, and black magic.',
    benefitHindi: 'सुबह और शाम 3-3 मर्तबा पढ़ने से दिनभर तमाम आफतों और हादसों से सुरक्षा रहती है।'
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const QUIZ_LIST: QuizQuestion[] = [
  {
    question: "खाना खाने से पहले भूल जाने पर कौन सी दुआ पढ़ी जाती है?",
    options: [
      "Bismillahir-rahmanir-rahim",
      "Bismillahi awwalahu wa aakhirahu",
      "Allahumma bismika amootu wa ahya",
      "Alhamdu lillahil-ladhee"
    ],
    correctIndex: 1
  },
  {
    question: "मस्जिद में दाखिल होते वक्त कौन सा पैर आगे रखना चाहिए और क्या दुआ पढ़नी चाहिए?",
    options: [
      "उल्टा पैर और 'Allahumma innee as'aluka...'",
      "दायां पैर और 'Allahummaf-tah lee abwaba rahmatik'",
      "दायां पैर और शौचालय की दुआ",
      "कोई भी पैर और सोने की दुआ"
    ],
    correctIndex: 1
  },
  {
    question: "'Rabbiir-hamhuma kama rabbayanee sagheera' किसके लिए दुआ है?",
    options: [
      "दोस्तों के लिए",
      "इम्तिहान में कामयाबी के लिए",
      "माता-पिता (वालिदैन) के लिए रहमत की दुआ",
      "रास्ते में चलते समय की दुआ"
    ],
    correctIndex: 2
  },
  {
    question: "ज्ञान और याददाश्त की बढ़ोतरी के लिए किस दुआ को बार-बार पढ़ा जाता है?",
    options: [
      "اللَّهُمَّ بَارِكْ لَنَا",
      "رَّبِّ زِدْنِي عِلْمًا (Rabbi zidnee 'ilma)",
      "Bismillahi awwalahu",
      "غُفْرَانَكَ"
    ],
    correctIndex: 1
  },
  {
    question: "मस्जिद से बाहर निकलते समय अल्लाह से उसका क्या मांगना चाहिए?",
    options: [
      "उसका ग़ुस्सा",
      "उसका फज़्ल व कर्म (Allahumma innee as'aluka min fadlik)",
      "सिर्फ नींद आना",
      "जहन्नम की आग"
    ],
    correctIndex: 1
  }
];

interface TasbeehItem {
  name: string;
  arabic: string;
  hindi: string;
  english: string;
  audioText: string;
}

const TASBEEH_ADHKAR: TasbeehItem[] = [
  { name: "Subhanallah", arabic: "سُبْحَانَ اللَّهِ", hindi: "सुब्हान अल्लाह (अल्लाह पाकीज़ा है)", english: "Glory be to Allah", audioText: "Subhan Allah" },
  { name: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", hindi: "अल्हम्दु लिल्लाह (सब तारीफें अल्लाह के लिए)", english: "Praise be to Allah", audioText: "Alhamdulillah" },
  { name: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", hindi: "अल्लाहू अकबर (अल्लाह सबसे बड़ा है)", english: "Allah is the Greatest", audioText: "Allahu Akbar" },
  { name: "Astagfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", hindi: "अस्तग़फ़िरुल्लाह (मैं अपने गुनाहों की माफी मांगता हूँ)", english: "I seek forgiveness from Allah", audioText: "Astagfirullah" },
  { name: "La Ilaha Illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", hindi: "ला इलाहा इल्लल्लाह (अल्लाह के सिवा कोई इबादत के लायक नहीं)", english: "There is no deity but Allah", audioText: "La Ilaha Illallah" },
  { name: "Darood-e-Noor", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", hindi: "अल्लाहूम्मा सल्ली अला मुहम्मद (दुरूद शरीफ़)", english: "O Allah, send peace upon Prophet Muhammad", audioText: "Allahumma salli ala muhammad" },
];

interface DuaPortalProps {
  duas?: Dua[];
}

export default function DuaPortal({ duas }: DuaPortalProps) {
  const dbDuas = duas && duas.length > 0 ? duas : DUAS_DATABASE;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [memorizedDuas, setMemorizedDuas] = useState<Record<string, 'not' | 'doing' | 'done'>>({});
  
  // Audio Speech States
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speakingLanguage, setSpeakingLanguage] = useState<'ar' | 'hi'>('hi');

  // Tasbeeh States
  const [selectedAdhkarIndex, setSelectedAdhkarIndex] = useState(0);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [todayAdhkarTarget, setTodayAdhkarTarget] = useState(1000);
  const [tasbeehHistory, setTasbeehHistory] = useState<number>(0);

  // Quiz States
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string>('');

  // Daily target notification check
  const [targetReached, setTargetReached] = useState(false);

  // Load persistence
  useEffect(() => {
    const storedProgress = localStorage.getItem('madarsa_duas_progress');
    if (storedProgress) {
      try {
        setMemorizedDuas(JSON.parse(storedProgress));
      } catch (e) {}
    }

    const storedTasbeeh = localStorage.getItem('madarsa_tasbeeh_count');
    if (storedTasbeeh) {
      setTasbeehCount(Number(storedTasbeeh));
    }

    const storedCumulative = localStorage.getItem('madarsa_tasbeeh_cumulative');
    if (storedCumulative) {
      setTasbeehHistory(Number(storedCumulative));
    }
  }, []);

  const handleUpdateProgress = (id: string, status: 'not' | 'doing' | 'done') => {
    const updated = { ...memorizedDuas, [id]: status };
    setMemorizedDuas(updated);
    localStorage.setItem('madarsa_duas_progress', JSON.stringify(updated));

    if (status === 'done') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#059669', '#f59e0b', '#10b981']
      });
    }
  };

  // Speaks aloud translation or phonetic translation
  const handleTTS = (dua: Dua, mode: 'arabic' | 'hindi') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      if (speakingId === `${dua.id}_${mode}`) {
        setSpeakingId(null);
        return;
      }

      setSpeakingId(`${dua.id}_${mode}`);
      const textToSpeak = mode === 'arabic' 
        ? dua.transliteration // Standard English characters recite beautifully under default settings
        : dua.translationHindi;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = mode === 'arabic' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.85; // slightly slower for clean pronunciation

      utterance.onend = () => {
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser speech synthesis not supported on this device.");
    }
  };

  // Speech for Tasbeeh Count
  const speakTasbeehText = (item: TasbeehItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.audioText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // increment counter
  const incrementTasbeeh = () => {
    const currentAdhkar = TASBEEH_ADHKAR[selectedAdhkarIndex];
    if (tasbeehCount % 10 === 0) {
      speakTasbeehText(currentAdhkar);
    }

    const nextVal = tasbeehCount + 1;
    setTasbeehCount(nextVal);
    localStorage.setItem('madarsa_tasbeeh_count', nextVal.toString());

    // cumulative records
    const nextCumulative = tasbeehHistory + 1;
    setTasbeehHistory(nextCumulative);
    localStorage.setItem('madarsa_tasbeeh_cumulative', nextCumulative.toString());

    // check congrats triggers
    if (nextVal >= todayAdhkarTarget && !targetReached) {
      setTargetReached(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });
    }
  };

  const resetTasbeehCounter = () => {
    if (window.confirm("क्या आप आज का तस्बीह काउंटर रीसेट करना चाहते हैं?")) {
      setTasbeehCount(0);
      setTargetReached(false);
      localStorage.setItem('madarsa_tasbeeh_count', '0');
    }
  };

  // Filter criteria
  const filteredDuas = dbDuas.filter(dua => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = 
      dua.title.toLowerCase().includes(query) ||
      dua.titleHindi.includes(query) ||
      dua.transliteration.toLowerCase().includes(query) ||
      dua.translationHindi.includes(query) ||
      dua.arabic.includes(query);

    const matchCategory = selectedCategory === 'all' || dua.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  // Quiz Handling
  const handleAnswerSubmit = (optionIdx: number) => {
    setSelectedOptionIndex(optionIdx);
    const question = QUIZ_LIST[currentQuestionIndex];
    if (optionIdx === question.correctIndex) {
      setQuizScore(prev => prev + 1);
      setQuizFeedback("MASHA’ALLAH! सही जवाब है! 🎉");
      // sound or small confetti
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#f59e0b']
      });
    } else {
      setQuizFeedback(`अफ़सोस! सही जवाब था: "${question.options[question.correctIndex]}"`);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    setQuizFeedback('');
    if (currentQuestionIndex + 1 < QUIZ_LIST.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      if (quizScore >= 3) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleQuizReset = () => {
    setQuizScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setQuizFinished(false);
    setQuizFeedback('');
    setShowQuiz(true);
  };

  // Progress calculations
  const totalDuas = dbDuas.length;
  const learnedCount = Object.values(memorizedDuas).filter(status => status === 'done').length;
  const learningPercentage = totalDuas > 0 ? Math.round((learnedCount / totalDuas) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in" id="duas-portal-root">
      {/* Top Banner Design Concept */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 md:p-10 text-white shadow-xl border border-emerald-700/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent)] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/60 backdrop-blur border border-emerald-500/35 rounded-full text-xs font-bold text-emerald-200 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              दुआ और अज़कार याद करने का आसान तरीक़ा
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight">
              Ramadan & Masnoon Duas
              <span className="block text-xl md:text-2xl mt-1 text-emerald-300 font-medium font-serif italic">
                मसनून दुआएं और तस्बीह गैलरी (दुआ व ज़िक्र पोर्टल)
              </span>
            </h1>
            <p className="text-sm text-emerald-100 leading-relaxed pt-1">
              अनाथ, गरीब और मदरसे के छोटे और बड़े प्यारे बच्चों के लिए दैनिक जीवन में काम आने वाली दुआएं, हिंदी तर्जुमा और ऑडियो उच्चारण के साथ। याद करें और रोज़ाना का 1000 तस्बीह का ज़िक्र पूरा करें।
            </p>
          </div>

          {/* Dynamic Progress Circular Meter */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 text-center flex flex-col items-center shrink-0 min-w-[150px]">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="36" cy="36" r="32" className="text-slate-700" strokeWidth="6" fill="transparent" stroke="currentColor" />
                <circle cx="36" cy="36" r="32" className="text-emerald-400 transition-all duration-500" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - learningPercentage / 100)} stroke="currentColor" />
              </svg>
              <span className="absolute text-lg font-black">{learningPercentage}%</span>
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-300 tracking-wider uppercase">याददाश्त प्रगति (LEARNED)</div>
            <span className="text-xs text-slate-300 font-mono font-bold mt-0.5">{learnedCount} / {totalDuas} दुआएं</span>
          </div>
        </div>
      </div>

      {/* 📖 Interactive Dua Slideshow Player (दुआ स्लाइड शो यादगारी चक्र) */}
      {dbDuas.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900/60 dark:to-slate-950/60 p-6 md:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-950 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span className="text-2xl">📖</span>
                दुआ स्लाइड शो (Dua Slideshow Player)
              </h2>
              <p className="text-xs text-slate-505 dark:text-slate-400">
                एक-एक करके कुल {dbDuas.length} मसनून दुआएं याद करें। "अगला" और "पिछला" बटन दबाकर आगे बढ़ें।
              </p>
            </div>
            
            {/* Quick Slide Badge Counter */}
            <div className="px-4 py-2 bg-emerald-600 text-white font-mono text-sm font-black rounded-xl shadow-md">
              Dua {Math.min(currentSlideIndex + 1, dbDuas.length)} / {dbDuas.length}
            </div>
          </div>

          {/* Core Interactive Card Container */}
          {(() => {
            const slideDua = dbDuas[currentSlideIndex % dbDuas.length];
            if (!slideDua) return null;
            const slideStatus = memorizedDuas[slideDua.id] || 'not';
            return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-6 md:p-8 shadow-inner relative overflow-hidden space-y-6">
                
                {/* Status Indicator Watermark */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                    slideStatus === 'done' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                      : slideStatus === 'doing'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
                  }`}>
                    {slideStatus === 'done' ? '✅ LEARNED' : slideStatus === 'doing' ? '⏳ LEARNING' : '📖 NOT READY'}
                  </span>
                </div>

                {/* Dua Category & Title */}
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full w-fit">
                    Category: {slideDua.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white mt-3">
                    {slideDua.titleHindi}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 italic">
                    {slideDua.title}
                  </p>
                </div>

                {/* Holy Quranic Green Arabic Block */}
                <div className="my-6 bg-slate-900 dark:bg-black/80 text-white rounded-2xl p-6 md:p-8 text-center border-l-8 border-emerald-500 shadow-lg relative">
                  <span className="absolute left-4 top-4 text-[9px] font-mono font-bold text-slate-400 tracking-wider">ARABIC LANGUAGE</span>
                  <p dir="rtl" className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-emerald-300 leading-wider py-4 tracking-wide break-words select-all">
                    {slideDua.arabic}
                  </p>
                </div>

                {/* Roman Transliteration & Pronunciation */}
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800 font-mono text-xs md:text-sm tracking-wide text-amber-750 dark:text-amber-400 flex items-start gap-2 select-all leading-relaxed">
                    <span className="text-base select-none shrink-0">🗣️</span>
                    <div>
                      <strong className="text-[10px] block uppercase font-sans text-slate-400 tracking-wider mb-1">Pronunciation (रोमन शब्द)</strong>
                      {slideDua.transliteration}
                    </div>
                  </div>

                  {/* Hindi & Urdu translation split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/35 rounded-xl border border-slate-100 dark:border-slate-800 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-550 dark:text-slate-400 tracking-wider text-[10px] block uppercase mb-1">Hindi Translation (हिन्दी अनुवाद)</strong>
                      {slideDua.translationHindi}
                    </div>
                    <div dir="rtl" className="p-4 bg-slate-50/50 dark:bg-slate-950/35 rounded-xl border border-slate-100 dark:border-slate-800 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-right pr-6">
                      <strong className="text-slate-550 dark:text-slate-400 tracking-wider text-[10px] block font-sans text-left left-0 uppercase mb-1">Urdu Translation (اردو ترجمہ)</strong>
                      {slideDua.translationUrdu}
                    </div>
                  </div>

                  {/* Benefit block */}
                  {slideDua.benefitHindi && (
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-400 flex gap-2 items-start leading-relaxed shadow-sm">
                      <span className="text-base select-none">✨</span>
                      <div>
                        <strong className="text-[10px] uppercase tracking-wider block text-emerald-600 dark:text-emerald-350 mb-1">Benefit & Sunnah (फायदा व सुन्नत)</strong>
                        {slideDua.benefitHindi}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Controls row: Audio Reciters & Status modifier */}
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                  {/* Speech buttons */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleTTS(slideDua, 'arabic')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans tracking-wide transition flex items-center gap-1 cursor-pointer shadow-sm hover:scale-103 ${
                        speakingId === `${slideDua.id}_arabic`
                          ? 'bg-amber-500 text-slate-950 border border-amber-400 animate-pulse font-black'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Listen Recitation (अरबी उच्चारण)
                    </button>
                    <button
                      onClick={() => handleTTS(slideDua, 'hindi')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans tracking-wide transition flex items-center gap-1 cursor-pointer shadow-sm hover:scale-103 ${
                        speakingId === `${slideDua.id}_hindi`
                          ? 'bg-emerald-600 text-white border border-emerald-500 animate-pulse font-black'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                      Listen Translation (मन्शूर अनुवाद)
                    </button>
                  </div>

                  {/* Status Progress setter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase hidden sm:inline">याददाश्त स्थिति:</span>
                    <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-750">
                      {(['not', 'doing', 'done'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateProgress(slideDua.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                            slideStatus === st 
                              ? st === 'done'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : st === 'doing'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-red-500 text-white shadow-sm'
                              : 'text-slate-450 dark:text-slate-350 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          {st === 'done' ? 'याद है' : st === 'doing' ? 'सीख रहे' : 'अभी नहीं'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tactile Large Next and Previous Arrows */}
                <div className="flex justify-between items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      setCurrentSlideIndex(prev => (prev === 0 ? dbDuas.length - 1 : prev - 1));
                    }}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-800 dark:text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer select-none active:scale-97 border border-slate-200 dark:border-slate-700"
                    title="पिछली दुआ"
                  >
                    <span>👈 पिछला (Previous)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSlideIndex(prev => (prev + 1) % dbDuas.length);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-505 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer select-none active:scale-97 shadow-md"
                    title="अगली दुआ"
                  >
                    <span>अगला (Next) 👉</span>
                  </button>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* Main Grid Layout containing Dua Browser + Interactive Active Tasbeeh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span (2 cols): Dua Library & Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 space-y-4">
            
            {/* Header filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Book className="w-5 h-5 text-emerald-600" />
                दुआओं का विशाल ख़ज़ाना (Dua Search)
              </h2>

              {/* Start Quiz Button */}
              <button
                onClick={() => {
                  setShowQuiz(true);
                  handleQuizReset();
                }}
                className="w-full md:w-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-md"
              >
                <Trophy className="w-3.5 h-3.5" />
                Dua Memorization Quiz (परीक्षा खेलें)
              </button>
            </div>

            {/* Smart search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="दुआ का नाम, अरबी, हिन्दी, या रोमन शब्द लिखकर ढूँढें... (e.g. sone, khana, wudu, parent)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category selection bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: 'सभी दुआएं (All)' },
                { id: 'daily', label: 'दैनिक दिनचर्या (Daily)' },
                { id: 'namaz', label: 'नमाज़ व वज़ू (Salah)' },
                { id: 'quranic', label: 'क़ुरानी दुआएं (Rabbana)' },
                { id: 'ramadan', label: 'रमज़ान व रोज़ा (Fasting)' },
                { id: 'protection', label: 'सलामती व हिफाज़त (Safety)' },
                { id: 'kids', label: 'बच्चों के लिए आसान' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dynamic filtered records counts */}
            <span className="block text-xs font-mono font-bold text-slate-400 tracking-tight">
              कैटगरी में {filteredDuas.length} मसनून दुआएं मौजूद हैं
            </span>

            {/* The Cards list */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredDuas.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                  <span className="text-4xl">🔍</span>
                  <p className="text-sm font-bold text-slate-500 mt-2">कोई मेल खाती दुआ नही मिली। स्पेलिंग बदल कर देखें।</p>
                </div>
              ) : (
                filteredDuas.map((dua) => {
                  const status = memorizedDuas[dua.id] || 'not';
                  return (
                    <div 
                      key={dua.id} 
                      className={`p-5 rounded-2xl border transition-all duration-300 relative group ${
                        status === 'done' 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-950/50'
                          : status === 'doing'
                          ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-950/50'
                          : 'bg-slate-50/30 dark:bg-slate-850/25 border-slate-150 dark:border-slate-800'
                      }`}
                    >
                      {/* Top bar info */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="px-2 py-0.5 bg-slate-250 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wider">
                            {dua.category}
                          </span>
                          <h3 className="text-base font-black text-slate-800 dark:text-white mt-1.5 flex items-center gap-1.5">
                            {dua.titleHindi}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 hidden sm:inline">({dua.title})</span>
                          </h3>
                        </div>

                        {/* Interactive Speech Reciter & memorize selectors */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleTTS(dua, 'arabic')}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              speakingId === `${dua.id}_arabic`
                                ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                            title="अरबी का उच्चारण सुनें"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">recite</span>
                          </button>
                          <button
                            onClick={() => handleTTS(dua, 'hindi')}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              speakingId === `${dua.id}_hindi`
                                ? 'bg-emerald-500 border-emerald-400 text-white animate-pulse'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                            title="हिन्दी तर्जुमा सुनें"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">तर्जुमा</span>
                          </button>
                        </div>
                      </div>

                      {/* Huge Arabic Text Canvas */}
                      <div className="my-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 text-right">
                        <p dir="rtl" className="text-2xl md:text-3xl font-serif font-semibold text-emerald-850 dark:text-emerald-200 leading-loose select-all tracking-wide">
                          {dua.arabic}
                        </p>
                      </div>

                      {/* Transliteration and Hindi context */}
                      <div className="space-y-2 mt-3">
                        <div className="bg-slate-100/60 dark:bg-slate-900/60 p-2.5 rounded-lg text-xs font-mono font-bold text-amber-700 dark:text-amber-400 tracking-tight leading-relaxed select-all">
                          🗣️ {dua.transliteration}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-500 dark:text-slate-400">हिन्दी अनुवाद:</strong> {dua.translationHindi}
                        </div>
                        <div dir="rtl" className="text-xs text-slate-700 dark:text-slate-300 text-right pr-6 leading-relaxed font-serif">
                          <strong className="text-slate-500 dark:text-slate-400 font-sans">اردو ترجمہ:</strong> {dua.translationUrdu}
                        </div>
                        {dua.benefitHindi && (
                          <div className="text-[11px] text-emerald-650 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg leading-relaxed flex gap-1 items-start">
                            <span>✨</span>
                            <span><strong>फायदा व सुन्नत:</strong> {dua.benefitHindi}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom progress controller for kids */}
                      <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/80 flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">क्या आपको यह दुआ याद है?</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateProgress(dua.id, 'not')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              status === 'not'
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-150'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            नहीं (No)
                          </button>
                          <button
                            onClick={() => handleUpdateProgress(dua.id, 'doing')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              status === 'doing'
                                ? 'bg-amber-550 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            पढ़ रहे हैं (Learning)
                          </button>
                          <button
                            onClick={() => handleUpdateProgress(dua.id, 'done')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                              status === 'done'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            याद हो गई (Memorized)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Span (1 col): Custom Interactive 1000 Adhkar Counter & Game */}
        <div className="space-y-6">
          
          {/* Adhkar / Tasbeeh Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl shadow-xl text-white border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-bold text-amber-400 tracking-tight uppercase flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                1000 Adhkar Board
              </h2>
              <button 
                onClick={resetTasbeehCounter}
                className="p-1 hover:bg-slate-850/65 rounded-lg text-slate-400 hover:text-red-400 transition cursor-pointer"
                title="रीसेट काउंटर"
              >
                <RefreshCw className="w-4 h-4 text-xs" />
              </button>
            </div>

            <p className="text-[11px] text-slate-350 leading-relaxed">
              छोटे और बड़े बच्चे यहाँ से तस्बीह का ज़िक्र शुरू करें और रोज़ाना कम से कम <strong>1000 मर्तबा</strong> पढ़ने का लक्ष्य पूरा करें। (Click to advance counter!)
            </p>

            {/* Quick picker of Adhkar phrases */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">कलीमा/तस्बीह चुनें (Select Phrasing)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TASBEEH_ADHKAR.map((item, idx) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedAdhkarIndex(idx);
                      speakTasbeehText(item);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition truncate cursor-pointer ${
                      selectedAdhkarIndex === idx
                        ? 'bg-amber-500 text-slate-950 border-amber-450 shadow-md'
                        : 'bg-slate-850/50 hover:bg-slate-800 border-slate-750 text-slate-300'
                    }`}
                  >
                    💡 {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Large Interactive clicker container */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 text-center space-y-3 relative overflow-hidden">
              
              {/* Selected Adhkar visual display */}
              <div className="space-y-1">
                <span className="text-2xl font-serif text-emerald-400 block tracking-wider" dir="rtl">
                  {TASBEEH_ADHKAR[selectedAdhkarIndex].arabic}
                </span>
                <span className="text-[11px] text-amber-300 font-bold block">
                  {TASBEEH_ADHKAR[selectedAdhkarIndex].hindi}
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  ({TASBEEH_ADHKAR[selectedAdhkarIndex].english})
                </span>
              </div>

              {/* Dynamic Target progress bar */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>प्रगति (TARGET PROGRESS)</span>
                  <span>{tasbeehCount} / {todayAdhkarTarget} muns</span>
                </div>
                <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (tasbeehCount / todayAdhkarTarget) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Huge circular counter trigger button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={incrementTasbeeh}
                  className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border-8 border-slate-900 active:scale-95 hover:scale-103 transition-all flex flex-col justify-center items-center cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] group"
                >
                  <span className="text-3xl font-black font-mono tracking-tight text-white group-hover:scale-110 transition">
                    {tasbeehCount}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-emerald-100 tracking-widest mt-1">TAP / CLICK</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-900">
                <span>कुल तस्बीह (All Time Count)</span>
                <span className="text-emerald-300 text-xs font-mono font-bold">{tasbeehHistory} clicks</span>
              </div>
            </div>

            {/* Target Selectors */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-bold">रोज़ाना का लक्ष्य (Target)</span>
              <div className="flex gap-1.5">
                {[100, 500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      setTodayAdhkarTarget(val);
                      if (tasbeehCount >= val) setTargetReached(true);
                    }}
                    className={`px-2 py-1 rounded-lg font-mono font-bold text-[10px] transition cursor-pointer ${
                      todayAdhkarTarget === val
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Quiz Popup or Dashboard (inside right panel for best layout fits) */}
          {showQuiz && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border-2 border-amber-500/50 space-y-4 animate-scale-up">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                  दुआ याद करने का इम्तिहान (Quiz)
                </h3>
                <button 
                  onClick={() => setShowQuiz(false)} 
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  Dismiss x
                </button>
              </div>

              {!quizFinished ? (
                <div className="space-y-4">
                  {/* Progress info */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>सवाल (Question): {currentQuestionIndex + 1} / {QUIZ_LIST.length}</span>
                    <span className="text-emerald-600">अंक (Score): {quizScore}</span>
                  </div>

                  {/* Question Title */}
                  <p className="text-sm font-bold text-slate-850 dark:text-white bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                    ❓ {QUIZ_LIST[currentQuestionIndex].question}
                  </p>

                  {/* Options */}
                  <div className="space-y-1.5">
                    {QUIZ_LIST[currentQuestionIndex].options.map((opt, oIdx) => {
                      const isSelected = selectedOptionIndex === oIdx;
                      const isCorrect = oIdx === QUIZ_LIST[currentQuestionIndex].correctIndex;
                      
                      let btnStyle = "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border-slate-200 dark:border-slate-850 text-slate-755 dark:text-slate-300";
                      if (selectedOptionIndex !== null) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";
                        } else {
                          btnStyle = "bg-slate-50 dark:bg-slate-950 opacity-40 border-slate-150 dark:border-slate-850";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={selectedOptionIndex !== null}
                          onClick={() => handleAnswerSubmit(oIdx)}
                          className={`w-full p-2.5 text-left rounded-xl border text-xs font-bold transition flex items-center justify-between ${btnStyle} ${selectedOptionIndex === null ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          <span className="truncate">{opt}</span>
                          {selectedOptionIndex !== null && isCorrect && <span className="text-xs">✅</span>}
                          {selectedOptionIndex !== null && isSelected && !isCorrect && <span className="text-xs">❌</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback text */}
                  {quizFeedback && (
                    <div className="p-2.5 rounded-xl text-center text-xs font-bold leading-relaxed bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
                      {quizFeedback}
                    </div>
                  )}

                  {/* Next Question Control */}
                  {selectedOptionIndex !== null && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      अगला सवाल (Next)
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-500 shadow-inner">
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-md font-black text-slate-850 dark:text-white">मुबारकबाद! परीक्षा पूरी हुई!</h4>
                    <p className="text-xs text-slate-400">आपकी याददाश्त का स्कोर (Performance Board)</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-3xl font-black text-emerald-600 block">{quizScore} / {QUIZ_LIST.length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">सही उत्तर (Correct Answers)</span>
                    
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-2">
                      {quizScore === 5 ? "Subhanallah! बेहतरीन प्रदर्शन, आपको पूरी मसनून दुआएं ज़ुबानी याद हैं! 🌹" : 
                       quizScore >= 3 ? "Masha'allah! बहुत अच्छे, इसे और बेहतर करें! 👍" : 
                       "मेहनत जारी रखें, बार-बार मसनून दुआएं देखकर याद करें! 📖"}
                    </p>
                  </div>

                  <button
                    onClick={handleQuizReset}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    फिर से खेलें (Restart Test)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-black text-emerald-850 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span>🤲</span> मसनून दुआओं की अहमियत
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              दुआ मोमिन का हथियार है। हुज़ूर नबी-ए-करीम सल्लल्लाहु अलैहि वसल्लम ने फ़रमाया: "अद-दुआ उ मुख्खुल इबादह" (दुआ इबादत का मग़ज़ यानी दिमाग़ है)। बच्चों को बचपन से ही सुन्नत दुआएं याद कराएं ताकि उनकी ज़िंदगी सुन्नतों के साए में गुज़रे।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
