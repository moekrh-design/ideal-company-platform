// ===== بنك أسئلة نافس التجريبي =====
// gradeKey: p3=ثالث ابتدائي، p6=سادس ابتدائي، m3=ثالث متوسط
// بقية الصفوف: "تهيئة مهارية" بدون مسمى نافس

export const NAFIS_GRADE_SUBJECTS = {
  p3: ['math', 'arabic'],
  p6: ['math', 'arabic', 'science'],
  m3: ['math', 'arabic', 'science'],
  // بقية الصفوف: تهيئة مهارية عامة
  p1: ['arabic', 'math'],
  p2: ['arabic', 'math'],
  p4: ['arabic', 'math'],
  p5: ['arabic', 'math', 'science'],
  m1: ['arabic', 'math', 'science'],
  m2: ['arabic', 'math', 'science'],
  s1: ['arabic', 'math'],
  s2: ['arabic', 'math'],
  s3: ['arabic', 'math'],
};

export const NAFIS_SUBJECT_LABELS = {
  math: 'الرياضيات',
  arabic: 'اللغة العربية',
  science: 'العلوم',
};

// الصفوف التي تظهر لها مسمى "نافس التجريبي" رسمياً
export const NAFIS_OFFICIAL_GRADES = ['p3', 'p6', 'm3'];

export function isNafisOfficialGrade(gradeKey) {
  return NAFIS_OFFICIAL_GRADES.includes(gradeKey);
}

export function getNafisLabel(gradeKey) {
  return isNafisOfficialGrade(gradeKey) ? 'نافس التجريبي' : 'التهيئة المهارية';
}

// ===== بنك الأسئلة =====
export const NAFIS_QUESTION_BANK = [

  // ===== رياضيات - ثالث ابتدائي (p3) =====
  { id: 'q-p3-math-001', gradeKey: 'p3', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 45 + 38؟', options: ['73', '83', '82', '93'], correct: 1, explanation: '45 + 38 = 83' },
  { id: 'q-p3-math-002', gradeKey: 'p3', subject: 'math', skill: 'الطرح', difficulty: 'easy', question: 'كم يساوي 72 - 29؟', options: ['43', '53', '41', '44'], correct: 0, explanation: '72 - 29 = 43' },
  { id: 'q-p3-math-003', gradeKey: 'p3', subject: 'math', skill: 'الضرب', difficulty: 'medium', question: 'كم يساوي 6 × 7؟', options: ['36', '42', '48', '54'], correct: 1, explanation: '6 × 7 = 42' },
  { id: 'q-p3-math-004', gradeKey: 'p3', subject: 'math', skill: 'القسمة', difficulty: 'medium', question: 'كم يساوي 36 ÷ 4؟', options: ['7', '8', '9', '10'], correct: 2, explanation: '36 ÷ 4 = 9' },
  { id: 'q-p3-math-005', gradeKey: 'p3', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'ما العدد الذي يأتي بين 199 و 201؟', options: ['198', '200', '202', '203'], correct: 1, explanation: 'الأعداد المتتالية: 199، 200، 201' },
  { id: 'q-p3-math-006', gradeKey: 'p3', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'ما قيمة نصف 80؟', options: ['20', '30', '40', '50'], correct: 2, explanation: '80 ÷ 2 = 40' },
  { id: 'q-p3-math-007', gradeKey: 'p3', subject: 'math', skill: 'الهندسة', difficulty: 'easy', question: 'كم عدد أضلاع المثلث؟', options: ['2', '3', '4', '5'], correct: 1, explanation: 'المثلث له 3 أضلاع' },
  { id: 'q-p3-math-008', gradeKey: 'p3', subject: 'math', skill: 'القياس', difficulty: 'medium', question: 'كم سنتيمتراً في متر واحد؟', options: ['10', '100', '1000', '10000'], correct: 1, explanation: '1 متر = 100 سنتيمتر' },
  { id: 'q-p3-math-009', gradeKey: 'p3', subject: 'math', skill: 'الجمع', difficulty: 'hard', question: 'كم يساوي 127 + 245؟', options: ['362', '372', '382', '392'], correct: 1, explanation: '127 + 245 = 372' },
  { id: 'q-p3-math-010', gradeKey: 'p3', subject: 'math', skill: 'الضرب', difficulty: 'hard', question: 'كم يساوي 9 × 8؟', options: ['63', '72', '81', '54'], correct: 1, explanation: '9 × 8 = 72' },
  { id: 'q-p3-math-011', gradeKey: 'p3', subject: 'math', skill: 'الطرح', difficulty: 'hard', question: 'كم يساوي 300 - 147؟', options: ['143', '153', '163', '173'], correct: 1, explanation: '300 - 147 = 153' },
  { id: 'q-p3-math-012', gradeKey: 'p3', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما قيمة الرقم 4 في العدد 347؟', options: ['4', '40', '400', '4000'], correct: 1, explanation: 'الرقم 4 في خانة العشرات = 40' },

  // ===== عربي - ثالث ابتدائي (p3) =====
  { id: 'q-p3-arabic-001', gradeKey: 'p3', subject: 'arabic', skill: 'الإملاء', difficulty: 'easy', question: 'أي الكلمات التالية مكتوبة بشكل صحيح؟', options: ['أكل', 'اكل', 'أكّل', 'اكّل'], correct: 0, explanation: 'الكلمة الصحيحة: أكل' },
  { id: 'q-p3-arabic-002', gradeKey: 'p3', subject: 'arabic', skill: 'النحو', difficulty: 'easy', question: 'ما جمع كلمة "كتاب"؟', options: ['كتابات', 'كتب', 'أكتاب', 'كتابون'], correct: 1, explanation: 'جمع كتاب = كتب' },
  { id: 'q-p3-arabic-003', gradeKey: 'p3', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما مضاد كلمة "كبير"؟', options: ['طويل', 'صغير', 'قصير', 'ضيق'], correct: 1, explanation: 'مضاد كبير = صغير' },
  { id: 'q-p3-arabic-004', gradeKey: 'p3', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'أين تكتب الهمزة في كلمة "سؤال"؟', options: ['على الألف', 'على الواو', 'على الياء', 'على السطر'], correct: 1, explanation: 'همزة سؤال على الواو لأن الحركة قبلها ضمة' },
  { id: 'q-p3-arabic-005', gradeKey: 'p3', subject: 'arabic', skill: 'النحو', difficulty: 'easy', question: 'ما مفرد كلمة "أقلام"؟', options: ['قلمة', 'قلم', 'أقلم', 'قلام'], correct: 1, explanation: 'مفرد أقلام = قلم' },
  { id: 'q-p3-arabic-006', gradeKey: 'p3', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما مرادف كلمة "سعيد"؟', options: ['حزين', 'مسرور', 'خائف', 'غاضب'], correct: 1, explanation: 'مرادف سعيد = مسرور' },
  { id: 'q-p3-arabic-007', gradeKey: 'p3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع الكلمة المسطر عليها في: "جاء الطالبُ"؟', options: ['فعل', 'اسم', 'حرف', 'ضمير'], correct: 1, explanation: '"الطالب" اسم مرفوع فاعل' },
  { id: 'q-p3-arabic-008', gradeKey: 'p3', subject: 'arabic', skill: 'الإملاء', difficulty: 'hard', question: 'كيف تكتب التاء المربوطة في نهاية الكلمة عند الوقف؟', options: ['ة', 'ت', 'ه', 'ـة'], correct: 2, explanation: 'التاء المربوطة تُنطق هاءً عند الوقف' },
  { id: 'q-p3-arabic-009', gradeKey: 'p3', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'كم حرفاً في كلمة "مدرسة"؟', options: ['4', '5', '6', '7'], correct: 2, explanation: 'م-د-ر-س-ة = 5 حروف (والتاء المربوطة حرف)' },
  { id: 'q-p3-arabic-010', gradeKey: 'p3', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'أي الجمل التالية صحيحة نحوياً؟', options: ['ذهبتُ إلى المدرسةَ', 'ذهبتُ إلى المدرسةِ', 'ذهبتُ إلى المدرسةُ', 'ذهبتُ إلى المدرسةً'], correct: 1, explanation: 'المدرسة مجرورة بـ"إلى" فتأخذ الكسرة' },
  { id: 'q-p3-arabic-011', gradeKey: 'p3', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الحرف الصحيح في كلمة "ب__ر"؟ (بحر أو بئر)', options: ['بحر', 'بئر', 'بيئر', 'بأر'], correct: 1, explanation: 'بئر: مكان الماء' },
  { id: 'q-p3-arabic-012', gradeKey: 'p3', subject: 'arabic', skill: 'القراءة', difficulty: 'hard', question: 'ما معنى كلمة "الفجر"؟', options: ['غروب الشمس', 'منتصف الليل', 'أول ضوء النهار', 'وقت الظهر'], correct: 2, explanation: 'الفجر = أول ضوء النهار قبيل شروق الشمس' },

  // ===== رياضيات - سادس ابتدائي (p6) =====
  { id: 'q-p6-math-001', gradeKey: 'p6', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'كم يساوي 3/4 + 1/4؟', options: ['1/2', '4/4', '1', '2'], correct: 2, explanation: '3/4 + 1/4 = 4/4 = 1' },
  { id: 'q-p6-math-002', gradeKey: 'p6', subject: 'math', skill: 'النسبة والتناسب', difficulty: 'medium', question: 'إذا كانت نسبة الطلاب إلى المعلمين 20:1، وعدد المعلمين 5، فكم عدد الطلاب؟', options: ['25', '100', '50', '75'], correct: 1, explanation: '20 × 5 = 100 طالب' },
  { id: 'q-p6-math-003', gradeKey: 'p6', subject: 'math', skill: 'الأعداد العشرية', difficulty: 'medium', question: 'كم يساوي 3.5 × 2؟', options: ['6', '7', '7.5', '8'], correct: 1, explanation: '3.5 × 2 = 7' },
  { id: 'q-p6-math-004', gradeKey: 'p6', subject: 'math', skill: 'المساحة', difficulty: 'hard', question: 'ما مساحة مستطيل طوله 8 سم وعرضه 5 سم؟', options: ['26 سم²', '40 سم²', '13 سم²', '30 سم²'], correct: 1, explanation: 'المساحة = الطول × العرض = 8 × 5 = 40 سم²' },
  { id: 'q-p6-math-005', gradeKey: 'p6', subject: 'math', skill: 'الأعداد الأولية', difficulty: 'hard', question: 'أي من الأعداد التالية عدد أولي؟', options: ['4', '6', '9', '11'], correct: 3, explanation: '11 عدد أولي لا يقبل القسمة إلا على 1 وعلى نفسه' },
  { id: 'q-p6-math-006', gradeKey: 'p6', subject: 'math', skill: 'الكسور', difficulty: 'hard', question: 'كم يساوي 2/3 × 3/4؟', options: ['5/7', '6/12', '1/2', '2/4'], correct: 2, explanation: '2/3 × 3/4 = 6/12 = 1/2' },
  { id: 'q-p6-math-007', gradeKey: 'p6', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'كم درجة مجموع زوايا المثلث؟', options: ['90°', '180°', '270°', '360°'], correct: 1, explanation: 'مجموع زوايا المثلث = 180 درجة' },
  { id: 'q-p6-math-008', gradeKey: 'p6', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما متوسط الأعداد: 10، 20، 30؟', options: ['15', '20', '25', '30'], correct: 1, explanation: 'المتوسط = (10+20+30) ÷ 3 = 60 ÷ 3 = 20' },
  { id: 'q-p6-math-009', gradeKey: 'p6', subject: 'math', skill: 'النسبة المئوية', difficulty: 'hard', question: 'ما نسبة 25 من 100؟', options: ['10%', '20%', '25%', '30%'], correct: 2, explanation: '25 ÷ 100 × 100% = 25%' },
  { id: 'q-p6-math-010', gradeKey: 'p6', subject: 'math', skill: 'الأعداد العشرية', difficulty: 'easy', question: 'كم يساوي 0.5 + 0.25؟', options: ['0.70', '0.75', '0.80', '0.85'], correct: 1, explanation: '0.5 + 0.25 = 0.75' },
  { id: 'q-p6-math-011', gradeKey: 'p6', subject: 'math', skill: 'المحيط', difficulty: 'medium', question: 'ما محيط مربع طول ضلعه 6 سم؟', options: ['12 سم', '18 سم', '24 سم', '36 سم'], correct: 2, explanation: 'محيط المربع = 4 × الضلع = 4 × 6 = 24 سم' },
  { id: 'q-p6-math-012', gradeKey: 'p6', subject: 'math', skill: 'الكسور', difficulty: 'easy', question: 'ما الكسر الأكبر: 1/2 أم 1/3؟', options: ['1/2', '1/3', 'متساويان', 'لا يمكن المقارنة'], correct: 0, explanation: '1/2 = 0.5 أكبر من 1/3 ≈ 0.33' },

  // ===== عربي - سادس ابتدائي (p6) =====
  { id: 'q-p6-arabic-001', gradeKey: 'p6', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما إعراب "الطالبَ" في جملة: "رأيتُ الطالبَ"؟', options: ['فاعل مرفوع', 'مفعول به منصوب', 'مبتدأ مرفوع', 'خبر مرفوع'], correct: 1, explanation: '"الطالب" مفعول به منصوب وعلامة نصبه الفتحة' },
  { id: 'q-p6-arabic-002', gradeKey: 'p6', subject: 'arabic', skill: 'الإملاء', difficulty: 'hard', question: 'أي الكلمات التالية فيها همزة قطع؟', options: ['اكتب', 'استمع', 'أكرم', 'انتظر'], correct: 2, explanation: '"أكرم" همزتها همزة قطع تُكتب دائماً' },
  { id: 'q-p6-arabic-003', gradeKey: 'p6', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'في قولنا "الوقت كالسيف"، ما نوع هذا الأسلوب؟', options: ['استعارة', 'تشبيه', 'كناية', 'مجاز'], correct: 1, explanation: 'هذا تشبيه: شبّه الوقت بالسيف بأداة التشبيه "الكاف"' },
  { id: 'q-p6-arabic-004', gradeKey: 'p6', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما علامة رفع الأسماء الخمسة؟', options: ['الضمة', 'الواو', 'الألف', 'الياء'], correct: 1, explanation: 'الأسماء الخمسة تُرفع بالواو' },
  { id: 'q-p6-arabic-005', gradeKey: 'p6', subject: 'arabic', skill: 'الصرف', difficulty: 'hard', question: 'ما وزن كلمة "كاتب"؟', options: ['فاعل', 'فعّال', 'مفعول', 'فعيل'], correct: 0, explanation: 'كاتب على وزن فاعل (اسم فاعل)' },
  { id: 'q-p6-arabic-006', gradeKey: 'p6', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما الفرق بين الفعل المتعدي واللازم؟', options: ['المتعدي يحتاج فاعلاً، اللازم لا', 'المتعدي يحتاج مفعولاً به، اللازم لا', 'المتعدي ماضٍ، اللازم مضارع', 'لا فرق بينهما'], correct: 1, explanation: 'الفعل المتعدي يحتاج مفعولاً به، واللازم يكتفي بفاعله' },
  { id: 'q-p6-arabic-007', gradeKey: 'p6', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'أين تكتب الهمزة في "يسأل"؟', options: ['على الألف', 'على الواو', 'على الياء', 'على السطر'], correct: 0, explanation: 'همزة "يسأل" على الألف لأن الحركة قبلها فتحة' },
  { id: 'q-p6-arabic-008', gradeKey: 'p6', subject: 'arabic', skill: 'النحو', difficulty: 'easy', question: 'ما الفعل في الجملة: "كتب الطالبُ الدرسَ"؟', options: ['الطالب', 'كتب', 'الدرس', 'ال'], correct: 1, explanation: '"كتب" هو الفعل الماضي في الجملة' },
  { id: 'q-p6-arabic-009', gradeKey: 'p6', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما معنى "الكناية"؟', options: ['التشبيه المباشر', 'التعبير عن شيء بذكر لازمه', 'استعمال الكلمة في غير معناها', 'المبالغة في الوصف'], correct: 1, explanation: 'الكناية: التعبير عن شيء بذكر لازمه دون التصريح به' },
  { id: 'q-p6-arabic-010', gradeKey: 'p6', subject: 'arabic', skill: 'الصرف', difficulty: 'medium', question: 'ما جمع "مدير"؟', options: ['مديرون', 'مديرين', 'مديرات', 'كل ما سبق صحيح'], correct: 3, explanation: 'مدير: مديرون (للمذكر)، مديرات (للمؤنث)' },
  { id: 'q-p6-arabic-011', gradeKey: 'p6', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما مضاد "الجهل"؟', options: ['الغباء', 'العلم', 'الكسل', 'الضعف'], correct: 1, explanation: 'مضاد الجهل = العلم' },
  { id: 'q-p6-arabic-012', gradeKey: 'p6', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع "لا" في: "لا تكسل"؟', options: ['لا النافية', 'لا الناهية', 'لا النافية للجنس', 'لا الزائدة'], correct: 1, explanation: '"لا" هنا ناهية تجزم الفعل المضارع' },

  // ===== علوم - سادس ابتدائي (p6) =====
  { id: 'q-p6-science-001', gradeKey: 'p6', subject: 'science', skill: 'الأحياء', difficulty: 'easy', question: 'ما عملية صنع الغذاء في النبات؟', options: ['التنفس', 'البناء الضوئي', 'الهضم', 'الإخراج'], correct: 1, explanation: 'النبات يصنع غذاءه عن طريق عملية البناء الضوئي (التمثيل الضوئي)' },
  { id: 'q-p6-science-002', gradeKey: 'p6', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما وحدة قياس الطاقة؟', options: ['نيوتن', 'جول', 'واط', 'أمبير'], correct: 1, explanation: 'وحدة قياس الطاقة = الجول (J)' },
  { id: 'q-p6-science-003', gradeKey: 'p6', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما الصيغة الكيميائية للماء؟', options: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1, explanation: 'الماء = H2O (ذرتا هيدروجين وذرة أكسجين)' },
  { id: 'q-p6-science-004', gradeKey: 'p6', subject: 'science', skill: 'الأرض والفضاء', difficulty: 'easy', question: 'ما أقرب كوكب إلى الشمس؟', options: ['الزهرة', 'الأرض', 'عطارد', 'المريخ'], correct: 2, explanation: 'عطارد هو أقرب الكواكب إلى الشمس' },
  { id: 'q-p6-science-005', gradeKey: 'p6', subject: 'science', skill: 'الأحياء', difficulty: 'medium', question: 'ما وظيفة خلايا الدم الحمراء؟', options: ['مقاومة الأمراض', 'نقل الأكسجين', 'تجلط الدم', 'هضم الغذاء'], correct: 1, explanation: 'خلايا الدم الحمراء تنقل الأكسجين من الرئتين إلى أنحاء الجسم' },
  { id: 'q-p6-science-006', gradeKey: 'p6', subject: 'science', skill: 'الفيزياء', difficulty: 'hard', question: 'ما نوع الطاقة في الطعام؟', options: ['طاقة حرارية', 'طاقة كيميائية', 'طاقة ضوئية', 'طاقة حركية'], correct: 1, explanation: 'الطعام يحتوي على طاقة كيميائية مخزنة' },
  { id: 'q-p6-science-007', gradeKey: 'p6', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما حالة الماء عند 0 درجة مئوية؟', options: ['سائل', 'صلب (جليد)', 'غاز', 'بخار'], correct: 1, explanation: 'الماء يتجمد عند 0 درجة مئوية ليصبح جليداً' },
  { id: 'q-p6-science-008', gradeKey: 'p6', subject: 'science', skill: 'الأحياء', difficulty: 'easy', question: 'كم عدد أجزاء جسم الحشرة؟', options: ['2', '3', '4', '5'], correct: 1, explanation: 'جسم الحشرة يتكون من 3 أجزاء: الرأس والصدر والبطن' },
  { id: 'q-p6-science-009', gradeKey: 'p6', subject: 'science', skill: 'الأرض والفضاء', difficulty: 'medium', question: 'كم يستغرق دوران الأرض حول نفسها؟', options: ['ساعة', '12 ساعة', '24 ساعة', '365 يوماً'], correct: 2, explanation: 'الأرض تدور حول نفسها في 24 ساعة (يوم كامل)' },
  { id: 'q-p6-science-010', gradeKey: 'p6', subject: 'science', skill: 'الفيزياء', difficulty: 'hard', question: 'ما الذي يحدث للضوء عند مروره من الهواء إلى الماء؟', options: ['ينعكس فقط', 'ينكسر', 'يختفي', 'يتسارع'], correct: 1, explanation: 'الضوء ينكسر (يغير اتجاهه) عند الانتقال بين وسطين مختلفين' },
  { id: 'q-p6-science-011', gradeKey: 'p6', subject: 'science', skill: 'الكيمياء', difficulty: 'easy', question: 'ما الغاز الذي نتنفسه؟', options: ['ثاني أكسيد الكربون', 'النيتروجين', 'الأكسجين', 'الهيدروجين'], correct: 2, explanation: 'نتنفس الأكسجين (O2) لاستمرار الحياة' },
  { id: 'q-p6-science-012', gradeKey: 'p6', subject: 'science', skill: 'الأحياء', difficulty: 'hard', question: 'ما وظيفة الكلوروفيل في النبات؟', options: ['نقل الماء', 'امتصاص ضوء الشمس', 'تخزين الغذاء', 'حماية النبات'], correct: 1, explanation: 'الكلوروفيل يمتص ضوء الشمس لعملية البناء الضوئي' },

  // ===== رياضيات - ثالث متوسط (m3) =====
  { id: 'q-m3-math-001', gradeKey: 'm3', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'إذا كان 2x + 4 = 10، فما قيمة x؟', options: ['2', '3', '4', '5'], correct: 1, explanation: '2x = 10 - 4 = 6، إذن x = 3' },
  { id: 'q-m3-math-002', gradeKey: 'm3', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'ما مساحة دائرة نصف قطرها 7 سم؟ (π ≈ 22/7)', options: ['44 سم²', '154 سم²', '22 سم²', '77 سم²'], correct: 1, explanation: 'المساحة = π × r² = 22/7 × 49 = 154 سم²' },
  { id: 'q-m3-math-003', gradeKey: 'm3', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما الوسيط للأعداد: 3، 5، 7، 9، 11؟', options: ['5', '7', '9', '6'], correct: 1, explanation: 'الوسيط = العدد الأوسط بعد الترتيب = 7' },
  { id: 'q-m3-math-004', gradeKey: 'm3', subject: 'math', skill: 'الاحتمالات', difficulty: 'hard', question: 'ما احتمال ظهور وجه "نقش" عند رمي عملة معدنية؟', options: ['1/4', '1/3', '1/2', '2/3'], correct: 2, explanation: 'احتمال النقش = 1/2 (وجهان متساويان)' },
  { id: 'q-m3-math-005', gradeKey: 'm3', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما ناتج (x + 3)(x - 3)؟', options: ['x² - 9', 'x² + 9', 'x² - 6x + 9', 'x² + 6x - 9'], correct: 0, explanation: '(x+3)(x-3) = x² - 9 (الفرق بين مربعين)' },
  { id: 'q-m3-math-006', gradeKey: 'm3', subject: 'math', skill: 'المثلثات', difficulty: 'hard', question: 'في مثلث قائم، إذا كانت الزاوية A = 30°، فما قيمة sin(30°)؟', options: ['1/2', '√3/2', '√2/2', '1'], correct: 0, explanation: 'sin(30°) = 1/2' },
  { id: 'q-m3-math-007', gradeKey: 'm3', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما قيمة 2³ × 2²؟', options: ['2⁵', '2⁶', '4⁵', '4⁶'], correct: 0, explanation: '2³ × 2² = 2^(3+2) = 2⁵ = 32' },
  { id: 'q-m3-math-008', gradeKey: 'm3', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'ما محيط دائرة قطرها 14 سم؟ (π ≈ 22/7)', options: ['22 سم', '44 سم', '88 سم', '154 سم'], correct: 1, explanation: 'المحيط = π × d = 22/7 × 14 = 44 سم' },
  { id: 'q-m3-math-009', gradeKey: 'm3', subject: 'math', skill: 'الجبر', difficulty: 'easy', question: 'ما قيمة 5² - 3²؟', options: ['4', '16', '25', '34'], correct: 1, explanation: '5² - 3² = 25 - 9 = 16' },
  { id: 'q-m3-math-010', gradeKey: 'm3', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما المنوال للأعداد: 2، 3، 3، 4، 5، 3، 7؟', options: ['2', '3', '4', '5'], correct: 1, explanation: 'المنوال = العدد الأكثر تكراراً = 3 (تكرر 3 مرات)' },
  { id: 'q-m3-math-011', gradeKey: 'm3', subject: 'math', skill: 'الأعداد', difficulty: 'hard', question: 'ما قيمة √144؟', options: ['10', '11', '12', '13'], correct: 2, explanation: '√144 = 12 لأن 12² = 144' },
  { id: 'q-m3-math-012', gradeKey: 'm3', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما حل المعادلة: x² = 25؟', options: ['x = 5', 'x = -5', 'x = ±5', 'x = 25'], correct: 2, explanation: 'x² = 25 → x = ±5 (موجب وسالب)' },

  // ===== عربي - ثالث متوسط (m3) =====
  { id: 'q-m3-arabic-001', gradeKey: 'm3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما إعراب "الكتابِ" في: "قرأتُ في الكتابِ"؟', options: ['فاعل مرفوع', 'مفعول به منصوب', 'مجرور بحرف الجر', 'مبتدأ مرفوع'], correct: 2, explanation: '"الكتاب" مجرور بحرف الجر "في"' },
  { id: 'q-m3-arabic-002', gradeKey: 'm3', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما نوع الأسلوب في: "يداه كالسيف في الكرم"؟', options: ['تشبيه تمثيلي', 'تشبيه بليغ', 'استعارة مكنية', 'كناية'], correct: 3, explanation: 'هذه كناية عن الكرم بذكر لازمه (السيف في الكرم)' },
  { id: 'q-m3-arabic-003', gradeKey: 'm3', subject: 'arabic', skill: 'الصرف', difficulty: 'hard', question: 'ما المصدر من الفعل "انطلق"؟', options: ['انطلاق', 'طلوق', 'مطلق', 'طلق'], correct: 0, explanation: 'مصدر انطلق = انطلاق (على وزن انفعال)' },
  { id: 'q-m3-arabic-004', gradeKey: 'm3', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الفرق بين "كان" و"إنّ"؟', options: ['كلاهما يرفع المبتدأ وينصب الخبر', 'كان ترفع الاسم وتنصب الخبر، إنّ تنصب الاسم وترفع الخبر', 'كلاهما ينصب الاسم ويرفع الخبر', 'لا فرق بينهما'], correct: 1, explanation: 'كان: اسمها مرفوع وخبرها منصوب. إنّ: اسمها منصوب وخبرها مرفوع' },
  { id: 'q-m3-arabic-005', gradeKey: 'm3', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما الفرق بين التشبيه والاستعارة؟', options: ['لا فرق', 'التشبيه يذكر أداة التشبيه، الاستعارة لا تذكرها', 'الاستعارة أضعف من التشبيه', 'التشبيه للمحسوس فقط'], correct: 1, explanation: 'التشبيه يذكر أداة التشبيه (مثل، كـ)، الاستعارة تحذف الأداة' },
  { id: 'q-m3-arabic-006', gradeKey: 'm3', subject: 'arabic', skill: 'الصرف', difficulty: 'medium', question: 'ما اسم الفاعل من "سافر"؟', options: ['مسافر', 'سفّار', 'سافر', 'سفير'], correct: 0, explanation: 'اسم الفاعل من سافر = مسافر (على وزن مفاعل)' },
  { id: 'q-m3-arabic-007', gradeKey: 'm3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع "ما" في: "ما جاء أحد"؟', options: ['ما الاستفهامية', 'ما النافية', 'ما الموصولة', 'ما الشرطية'], correct: 1, explanation: '"ما" هنا نافية بمعنى "لم"' },
  { id: 'q-m3-arabic-008', gradeKey: 'm3', subject: 'arabic', skill: 'البلاغة', difficulty: 'easy', question: 'ما معنى "المجاز"؟', options: ['الكلام الحقيقي', 'استخدام الكلمة في غير معناها الأصلي', 'المبالغة في الكلام', 'الكلام المختصر'], correct: 1, explanation: 'المجاز: استخدام الكلمة في غير معناها الحقيقي لعلاقة مع قرينة' },
  { id: 'q-m3-arabic-009', gradeKey: 'm3', subject: 'arabic', skill: 'الصرف', difficulty: 'hard', question: 'ما وزن كلمة "مكتبة"؟', options: ['مفعلة', 'فاعلة', 'فعّالة', 'مفعّلة'], correct: 0, explanation: 'مكتبة على وزن مَفعَلة (اسم مكان)' },
  { id: 'q-m3-arabic-010', gradeKey: 'm3', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الحروف التي تنصب المضارع؟', options: ['لم، لا، لن', 'أن، لن، كي، حتى', 'إن، لو، لما', 'قد، سوف، السين'], correct: 1, explanation: 'أن، لن، كي، حتى، لام التعليل = حروف نصب المضارع' },
  { id: 'q-m3-arabic-011', gradeKey: 'm3', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما نوع الأسلوب في: "قامت الحرب"؟', options: ['تشبيه', 'استعارة مكنية', 'كناية', 'مجاز مرسل'], correct: 1, explanation: 'استعارة مكنية: شبّهت الحرب بإنسان يقوم' },
  { id: 'q-m3-arabic-012', gradeKey: 'm3', subject: 'arabic', skill: 'الصرف', difficulty: 'medium', question: 'ما الفرق بين اسم الفاعل واسم المفعول؟', options: ['لا فرق', 'اسم الفاعل يدل على من فعل، اسم المفعول يدل على من وقع عليه الفعل', 'اسم الفاعل للمذكر، اسم المفعول للمؤنث', 'اسم الفاعل للماضي، اسم المفعول للمضارع'], correct: 1, explanation: 'اسم الفاعل: كاتب (من كتب). اسم المفعول: مكتوب (ما وقع عليه الكتابة)' },

  // ===== علوم - ثالث متوسط (m3) =====
  { id: 'q-m3-science-001', gradeKey: 'm3', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما عدد البروتونات في ذرة الكربون (العدد الذري 6)؟', options: ['3', '6', '12', '14'], correct: 1, explanation: 'عدد البروتونات = العدد الذري = 6' },
  { id: 'q-m3-science-002', gradeKey: 'm3', subject: 'science', skill: 'الفيزياء', difficulty: 'hard', question: 'ما قانون نيوتن الثاني؟', options: ['F = ma', 'E = mc²', 'P = mv', 'W = Fd'], correct: 0, explanation: 'قانون نيوتن الثاني: القوة = الكتلة × التسارع (F = ma)' },
  { id: 'q-m3-science-003', gradeKey: 'm3', subject: 'science', skill: 'الأحياء', difficulty: 'medium', question: 'ما وظيفة الميتوكوندريا في الخلية؟', options: ['تخزين المعلومات الوراثية', 'إنتاج الطاقة', 'بناء البروتينات', 'نقل المواد'], correct: 1, explanation: 'الميتوكوندريا = مصنع الطاقة في الخلية (تنتج ATP)' },
  { id: 'q-m3-science-004', gradeKey: 'm3', subject: 'science', skill: 'الكيمياء', difficulty: 'hard', question: 'ما ناتج تفاعل الحمض مع القاعدة؟', options: ['حمض أقوى', 'قاعدة أقوى', 'ملح وماء', 'غاز وماء'], correct: 2, explanation: 'تفاعل التعادل: حمض + قاعدة → ملح + ماء' },
  { id: 'q-m3-science-005', gradeKey: 'm3', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما وحدة قياس الشدة الكهربائية؟', options: ['فولت', 'أمبير', 'أوم', 'واط'], correct: 1, explanation: 'وحدة قياس شدة التيار الكهربائي = الأمبير (A)' },
  { id: 'q-m3-science-006', gradeKey: 'm3', subject: 'science', skill: 'الأحياء', difficulty: 'hard', question: 'ما الجزيء الذي يحمل المعلومات الوراثية؟', options: ['ATP', 'DNA', 'RNA', 'Protein'], correct: 1, explanation: 'DNA (الحمض النووي الريبوزي منقوص الأكسجين) يحمل المعلومات الوراثية' },
  { id: 'q-m3-science-007', gradeKey: 'm3', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما تعريف الأكسدة؟', options: ['اكتساب الإلكترونات', 'فقدان الإلكترونات', 'اكتساب البروتونات', 'فقدان النيوترونات'], correct: 1, explanation: 'الأكسدة = فقدان الإلكترونات (OILRIG: Oxidation Is Loss)' },
  { id: 'q-m3-science-008', gradeKey: 'm3', subject: 'science', skill: 'الفيزياء', difficulty: 'easy', question: 'ما سرعة الضوء تقريباً؟', options: ['300,000 كم/ثانية', '30,000 كم/ثانية', '3,000 كم/ثانية', '300 كم/ثانية'], correct: 0, explanation: 'سرعة الضوء ≈ 300,000 كيلومتر في الثانية' },
  { id: 'q-m3-science-009', gradeKey: 'm3', subject: 'science', skill: 'الأحياء', difficulty: 'medium', question: 'ما عملية انقسام الخلية لإنتاج خلايا جنسية؟', options: ['الانقسام المتساوي (Mitosis)', 'الانقسام المنصف (Meiosis)', 'التكاثر اللاجنسي', 'التكاثر البرعمي'], correct: 1, explanation: 'الانقسام المنصف (Meiosis) ينتج خلايا جنسية بنصف عدد الكروموسومات' },
  { id: 'q-m3-science-010', gradeKey: 'm3', subject: 'science', skill: 'الكيمياء', difficulty: 'hard', question: 'ما الرمز الكيميائي للذهب؟', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, explanation: 'الرمز الكيميائي للذهب = Au (من اللاتينية Aurum)' },
  { id: 'q-m3-science-011', gradeKey: 'm3', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما قانون أوم؟', options: ['V = IR', 'P = IV', 'F = ma', 'E = mc²'], correct: 0, explanation: 'قانون أوم: الجهد = شدة التيار × المقاومة (V = IR)' },
  { id: 'q-m3-science-012', gradeKey: 'm3', subject: 'science', skill: 'الأحياء', difficulty: 'easy', question: 'كم عدد كروموسومات الإنسان الطبيعي؟', options: ['23', '44', '46', '48'], correct: 2, explanation: 'الإنسان لديه 46 كروموسوم (23 زوجاً)' },

  // ===== رياضيات - أول ابتدائي (p1) - تهيئة مهارية =====
  { id: 'q-p1-math-001', gradeKey: 'p1', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'ما العدد الذي يأتي بعد 7؟', options: ['6', '7', '8', '9'], correct: 2, explanation: 'الأعداد: 6، 7، 8، 9 - العدد بعد 7 هو 8' },
  { id: 'q-p1-math-002', gradeKey: 'p1', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 3 + 4؟', options: ['5', '6', '7', '8'], correct: 2, explanation: '3 + 4 = 7' },
  { id: 'q-p1-math-003', gradeKey: 'p1', subject: 'math', skill: 'الطرح', difficulty: 'easy', question: 'كم يساوي 9 - 3؟', options: ['4', '5', '6', '7'], correct: 2, explanation: '9 - 3 = 6' },
  { id: 'q-p1-math-004', gradeKey: 'p1', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'أي عدد أكبر: 5 أم 8؟', options: ['5', '8', 'متساويان', 'لا يمكن المقارنة'], correct: 1, explanation: '8 > 5' },
  { id: 'q-p1-math-005', gradeKey: 'p1', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 2 + 2؟', options: ['3', '4', '5', '6'], correct: 1, explanation: '2 + 2 = 4' },
  { id: 'q-p1-math-006', gradeKey: 'p1', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'كم عدد الأصابع في يد واحدة؟', options: ['4', '5', '6', '10'], correct: 1, explanation: 'اليد الواحدة لها 5 أصابع' },
  { id: 'q-p1-math-007', gradeKey: 'p1', subject: 'math', skill: 'الطرح', difficulty: 'easy', question: 'كم يساوي 10 - 5؟', options: ['3', '4', '5', '6'], correct: 2, explanation: '10 - 5 = 5' },
  { id: 'q-p1-math-008', gradeKey: 'p1', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'ما العدد الذي يأتي قبل 10؟', options: ['7', '8', '9', '11'], correct: 2, explanation: 'الأعداد: 8، 9، 10 - العدد قبل 10 هو 9' },
  { id: 'q-p1-math-009', gradeKey: 'p1', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 1 + 1؟', options: ['1', '2', '3', '4'], correct: 1, explanation: '1 + 1 = 2' },
  { id: 'q-p1-math-010', gradeKey: 'p1', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correct: 2, explanation: 'أيام الأسبوع 7 أيام' },
  { id: 'q-p1-math-011', gradeKey: 'p1', subject: 'math', skill: 'الهندسة', difficulty: 'easy', question: 'ما شكل الكرة؟', options: ['مربع', 'مثلث', 'دائرة', 'مستطيل'], correct: 2, explanation: 'الكرة شكلها دائري' },
  { id: 'q-p1-math-012', gradeKey: 'p1', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 5 + 3؟', options: ['6', '7', '8', '9'], correct: 2, explanation: '5 + 3 = 8' },

  // ===== عربي - أول ابتدائي (p1) - تهيئة مهارية =====
  { id: 'q-p1-arabic-001', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'أي الحروف التالية هو حرف "باء"؟', options: ['ب', 'ت', 'ث', 'ج'], correct: 0, explanation: 'الحرف الأول هو "ب" (باء)' },
  { id: 'q-p1-arabic-002', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'كم حرفاً في كلمة "باب"؟', options: ['2', '3', '4', '5'], correct: 1, explanation: 'ب-ا-ب = 3 حروف' },
  { id: 'q-p1-arabic-003', gradeKey: 'p1', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما الحرف الأول في كلمة "أسد"؟', options: ['س', 'أ', 'د', 'ا'], correct: 1, explanation: 'كلمة "أسد" تبدأ بحرف "أ"' },
  { id: 'q-p1-arabic-004', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'أي الكلمات تبدأ بحرف "م"؟', options: ['بيت', 'مدرسة', 'كتاب', 'قلم'], correct: 1, explanation: '"مدرسة" تبدأ بحرف "م"' },
  { id: 'q-p1-arabic-005', gradeKey: 'p1', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما الحرف الأخير في كلمة "قلم"؟', options: ['ق', 'ل', 'م', 'ن'], correct: 2, explanation: 'كلمة "قلم" تنتهي بحرف "م"' },
  { id: 'q-p1-arabic-006', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'كم حرفاً في كلمة "كتاب"؟', options: ['3', '4', '5', '6'], correct: 1, explanation: 'ك-ت-ا-ب = 4 حروف' },
  { id: 'q-p1-arabic-007', gradeKey: 'p1', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'أي الكلمات تعني مكاناً للتعلم؟', options: ['بيت', 'مدرسة', 'سيارة', 'شجرة'], correct: 1, explanation: 'المدرسة هي مكان التعلم' },
  { id: 'q-p1-arabic-008', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'أي الحروف التالية هو "دال"؟', options: ['ذ', 'ر', 'د', 'ز'], correct: 2, explanation: 'الحرف الثالث هو "د" (دال)' },
  { id: 'q-p1-arabic-009', gradeKey: 'p1', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما الحيوان الذي يعيش في البحر؟', options: ['أسد', 'سمكة', 'طائر', 'حصان'], correct: 1, explanation: 'السمكة تعيش في البحر' },
  { id: 'q-p1-arabic-010', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'كم حرفاً في الأبجدية العربية؟', options: ['24', '26', '28', '30'], correct: 2, explanation: 'الأبجدية العربية تتكون من 28 حرفاً' },
  { id: 'q-p1-arabic-011', gradeKey: 'p1', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما لون السماء في النهار؟', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 1, explanation: 'السماء زرقاء في النهار' },
  { id: 'q-p1-arabic-012', gradeKey: 'p1', subject: 'arabic', skill: 'الحروف', difficulty: 'easy', question: 'أي الكلمات تبدأ بحرف "س"؟', options: ['قلم', 'نجم', 'سماء', 'بحر'], correct: 2, explanation: '"سماء" تبدأ بحرف "س"' },
];

// ===== دوال مساعدة =====

export function getQuestionsForGradeSubject(gradeKey, subject, count = 10) {
  const pool = NAFIS_QUESTION_BANK.filter(
    (q) => q.gradeKey === gradeKey && q.subject === subject
  );
  if (pool.length === 0) return [];
  // خلط الأسئلة عشوائياً
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  // خلط خيارات كل سؤال مع تتبع الإجابة الصحيحة
  return shuffled.slice(0, count).map((q) => {
    const correctText = q.options[q.correct];
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);
    return {
      ...q,
      options: shuffledOptions,
      correct: newCorrectIndex,
    };
  });
}

export function getSubjectsForGrade(gradeKey) {
  return NAFIS_GRADE_SUBJECTS[gradeKey] || ['arabic', 'math'];
}

export function calculateQuizScore(questions, answers) {
  let correct = 0;
  const details = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct;
    if (isCorrect) correct++;
    return {
      questionId: q.id,
      skill: q.skill,
      difficulty: q.difficulty,
      isCorrect,
      selectedAnswer: answers[i],
      correctAnswer: q.correct,
      explanation: q.explanation,
    };
  });
  const score = Math.round((correct / questions.length) * 100);
  const skillStats = {};
  details.forEach((d) => {
    if (!skillStats[d.skill]) skillStats[d.skill] = { correct: 0, total: 0 };
    skillStats[d.skill].total++;
    if (d.isCorrect) skillStats[d.skill].correct++;
  });
  return { correct, total: questions.length, score, details, skillStats };
}
