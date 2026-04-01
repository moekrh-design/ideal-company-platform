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

  // ===== تهيئة مهارية - ثاني ابتدائي (p2) =====
  { id: 'q-p2-arabic-001', gradeKey: 'p2', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما الحرف الأول في كلمة "باب"؟', options: ['أ', 'ب', 'ت', 'ث'], correct: 1, explanation: 'الحرف الأول في كلمة باب هو حرف الباء' },
  { id: 'q-p2-arabic-002', gradeKey: 'p2', subject: 'arabic', skill: 'الإملاء', difficulty: 'easy', question: 'كيف تكتب كلمة "شمس"؟', options: ['شمس', 'شمص', 'سمش', 'شمز'], correct: 0, explanation: 'شمس تُكتب: ش-م-س' },
  { id: 'q-p2-arabic-003', gradeKey: 'p2', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما ضد كلمة "كبير"؟', options: ['طويل', 'صغير', 'قصير', 'ثقيل'], correct: 1, explanation: 'ضد كبير = صغير' },
  { id: 'q-p2-arabic-004', gradeKey: 'p2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما جمع كلمة "كتاب"؟', options: ['كتابات', 'كتب', 'أكتب', 'كتيب'], correct: 1, explanation: 'جمع كتاب = كتب' },
  { id: 'q-p2-arabic-005', gradeKey: 'p2', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'أي الكلمات التالية تبدأ بحرف "م"؟', options: ['باب', 'نور', 'مدرسة', 'سماء'], correct: 2, explanation: 'مدرسة تبدأ بحرف الميم' },
  { id: 'q-p2-arabic-006', gradeKey: 'p2', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الحرف الناقص في كلمة "ق__م"؟', options: ['ل', 'ر', 'ن', 'م'], correct: 0, explanation: 'قلم: ق-ل-م' },
  { id: 'q-p2-arabic-007', gradeKey: 'p2', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما اسم الحيوان الذي يعطينا الحليب؟', options: ['الأسد', 'البقرة', 'الحصان', 'الطائر'], correct: 1, explanation: 'البقرة تعطينا الحليب' },
  { id: 'q-p2-arabic-008', gradeKey: 'p2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'أي الكلمات التالية اسم؟', options: ['ذهب', 'جميل', 'أكل', 'مدرسة'], correct: 3, explanation: 'مدرسة اسم، وذهب وأكل أفعال، وجميل صفة' },
  { id: 'q-p2-arabic-009', gradeKey: 'p2', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'كم عدد حروف كلمة "نافذة"؟', options: ['4', '5', '6', '7'], correct: 1, explanation: 'ن-ا-ف-ذ-ة = 5 حروف' },
  { id: 'q-p2-arabic-010', gradeKey: 'p2', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'أين تكتب الهمزة في كلمة "أمل"؟', options: ['على الألف', 'على الواو', 'على الياء', 'على السطر'], correct: 0, explanation: 'همزة أمل مفتوحة في أول الكلمة تُكتب على الألف' },
  { id: 'q-p2-arabic-011', gradeKey: 'p2', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما معنى كلمة "سريع"؟', options: ['بطيء', 'ثقيل', 'خفيف الحركة', 'ضخم'], correct: 2, explanation: 'سريع = خفيف الحركة، ضد بطيء' },
  { id: 'q-p2-arabic-012', gradeKey: 'p2', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما مؤنث كلمة "معلم"؟', options: ['معلمة', 'معلمات', 'معلمون', 'معلمين'], correct: 0, explanation: 'مؤنث معلم = معلمة' },
  { id: 'q-p2-math-001', gradeKey: 'p2', subject: 'math', skill: 'الجمع', difficulty: 'easy', question: 'كم يساوي 15 + 12؟', options: ['25', '27', '28', '30'], correct: 1, explanation: '15 + 12 = 27' },
  { id: 'q-p2-math-002', gradeKey: 'p2', subject: 'math', skill: 'الطرح', difficulty: 'easy', question: 'كم يساوي 20 - 8؟', options: ['10', '11', '12', '13'], correct: 2, explanation: '20 - 8 = 12' },
  { id: 'q-p2-math-003', gradeKey: 'p2', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'ما العدد الذي يأتي بعد 49؟', options: ['48', '50', '51', '52'], correct: 1, explanation: 'العدد الذي يأتي بعد 49 هو 50' },
  { id: 'q-p2-math-004', gradeKey: 'p2', subject: 'math', skill: 'الضرب', difficulty: 'medium', question: 'كم يساوي 3 × 4؟', options: ['7', '10', '12', '14'], correct: 2, explanation: '3 × 4 = 12' },
  { id: 'q-p2-math-005', gradeKey: 'p2', subject: 'math', skill: 'الأعداد', difficulty: 'easy', question: 'ما قيمة رقم 5 في العدد 52؟', options: ['5', '50', '500', '5000'], correct: 1, explanation: 'رقم 5 في خانة العشرات = 50' },
  { id: 'q-p2-math-006', gradeKey: 'p2', subject: 'math', skill: 'الجمع', difficulty: 'medium', question: 'كم يساوي 36 + 24؟', options: ['50', '55', '60', '65'], correct: 2, explanation: '36 + 24 = 60' },
  { id: 'q-p2-math-007', gradeKey: 'p2', subject: 'math', skill: 'الهندسة', difficulty: 'easy', question: 'كم عدد أضلاع المربع؟', options: ['3', '4', '5', '6'], correct: 1, explanation: 'المربع له 4 أضلاع متساوية' },
  { id: 'q-p2-math-008', gradeKey: 'p2', subject: 'math', skill: 'الوقت', difficulty: 'medium', question: 'كم ساعة في اليوم؟', options: ['12', '20', '24', '48'], correct: 2, explanation: 'اليوم = 24 ساعة' },
  { id: 'q-p2-math-009', gradeKey: 'p2', subject: 'math', skill: 'الطرح', difficulty: 'medium', question: 'كم يساوي 50 - 17؟', options: ['31', '33', '35', '37'], correct: 1, explanation: '50 - 17 = 33' },
  { id: 'q-p2-math-010', gradeKey: 'p2', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما أكبر عدد مكون من رقمين؟', options: ['89', '90', '99', '100'], correct: 2, explanation: 'أكبر عدد مكون من رقمين = 99' },
  { id: 'q-p2-math-011', gradeKey: 'p2', subject: 'math', skill: 'الضرب', difficulty: 'medium', question: 'كم يساوي 5 × 5؟', options: ['20', '25', '30', '35'], correct: 1, explanation: '5 × 5 = 25' },
  { id: 'q-p2-math-012', gradeKey: 'p2', subject: 'math', skill: 'القياس', difficulty: 'easy', question: 'كم يوماً في الأسبوع؟', options: ['5', '6', '7', '8'], correct: 2, explanation: 'الأسبوع = 7 أيام' },

  // ===== تهيئة مهارية - رابع ابتدائي (p4) =====
  { id: 'q-p4-arabic-001', gradeKey: 'p4', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما علامة رفع الاسم المفرد؟', options: ['الفتحة', 'الكسرة', 'الضمة', 'السكون'], correct: 2, explanation: 'علامة رفع الاسم المفرد = الضمة' },
  { id: 'q-p4-arabic-002', gradeKey: 'p4', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'أين تكتب الهمزة في كلمة "يسأل"؟', options: ['على الألف', 'على الواو', 'على الياء', 'على السطر'], correct: 0, explanation: 'همزة يسأل على الألف لأن الحركة قبلها فتحة' },
  { id: 'q-p4-arabic-003', gradeKey: 'p4', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما مرادف كلمة "شجاع"؟', options: ['خائف', 'جبان', 'بطل', 'ضعيف'], correct: 2, explanation: 'مرادف شجاع = بطل' },
  { id: 'q-p4-arabic-004', gradeKey: 'p4', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما جمع كلمة "طالب"؟', options: ['طلاب', 'طالبون', 'طالبات', 'طلبة'], correct: 0, explanation: 'جمع طالب = طلاب' },
  { id: 'q-p4-arabic-005', gradeKey: 'p4', subject: 'arabic', skill: 'القراءة', difficulty: 'hard', question: 'ما نوع الأسلوب في الجملة: "يا طالبَ العلم، اجتهد"؟', options: ['خبري', 'إنشائي', 'استفهامي', 'شرطي'], correct: 1, explanation: 'الجملة إنشائية لأنها تتضمن نداء وأمراً' },
  { id: 'q-p4-arabic-006', gradeKey: 'p4', subject: 'arabic', skill: 'الإملاء', difficulty: 'hard', question: 'ما الكلمة الصحيحة إملائياً؟', options: ['إجتهاد', 'اجتهاد', 'إجتهاد', 'اجتهاد'], correct: 1, explanation: 'اجتهاد تُكتب بهمزة وصل لا قطع' },
  { id: 'q-p4-arabic-007', gradeKey: 'p4', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما إعراب كلمة "الكتابَ" في: "قرأتُ الكتابَ"؟', options: ['فاعل مرفوع', 'مفعول به منصوب', 'مبتدأ مرفوع', 'خبر مرفوع'], correct: 1, explanation: 'الكتاب مفعول به منصوب بالفتحة' },
  { id: 'q-p4-arabic-008', gradeKey: 'p4', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما المقصود بـ"الجملة الاسمية"؟', options: ['جملة تبدأ بفعل', 'جملة تبدأ باسم', 'جملة تبدأ بحرف', 'جملة تبدأ بضمير'], correct: 1, explanation: 'الجملة الاسمية تبدأ باسم (مبتدأ)' },
  { id: 'q-p4-arabic-009', gradeKey: 'p4', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما ضد كلمة "حاضر"؟', options: ['موجود', 'غائب', 'قادم', 'ذاهب'], correct: 1, explanation: 'ضد حاضر = غائب' },
  { id: 'q-p4-arabic-010', gradeKey: 'p4', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'كيف تكتب التنوين بالفتح على كلمة "كتاب"؟', options: ['كتاباً', 'كتابٍ', 'كتابٌ', 'كتابَ'], correct: 0, explanation: 'التنوين بالفتح يُكتب على الألف المضافة: كتاباً' },
  { id: 'q-p4-arabic-011', gradeKey: 'p4', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الفعل الماضي من كلمة "يكتب"؟', options: ['اكتب', 'كتب', 'كاتب', 'مكتوب'], correct: 1, explanation: 'الفعل الماضي من يكتب = كتب' },
  { id: 'q-p4-arabic-012', gradeKey: 'p4', subject: 'arabic', skill: 'القراءة', difficulty: 'easy', question: 'ما معنى كلمة "الفلاح"؟', options: ['الطبيب', 'المزارع', 'المعلم', 'التاجر'], correct: 1, explanation: 'الفلاح = المزارع الذي يعمل في الأرض' },
  { id: 'q-p4-math-001', gradeKey: 'p4', subject: 'math', skill: 'الضرب', difficulty: 'medium', question: 'كم يساوي 12 × 8؟', options: ['86', '96', '106', '116'], correct: 1, explanation: '12 × 8 = 96' },
  { id: 'q-p4-math-002', gradeKey: 'p4', subject: 'math', skill: 'القسمة', difficulty: 'medium', question: 'كم يساوي 72 ÷ 9؟', options: ['6', '7', '8', '9'], correct: 2, explanation: '72 ÷ 9 = 8' },
  { id: 'q-p4-math-003', gradeKey: 'p4', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'ما قيمة ثلاثة أرباع العدد 40؟', options: ['20', '25', '30', '35'], correct: 2, explanation: '3/4 × 40 = 30' },
  { id: 'q-p4-math-004', gradeKey: 'p4', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'ما محيط مستطيل طوله 10 سم وعرضه 6 سم؟', options: ['28 سم', '32 سم', '36 سم', '60 سم'], correct: 1, explanation: 'المحيط = 2 × (10 + 6) = 2 × 16 = 32 سم' },
  { id: 'q-p4-math-005', gradeKey: 'p4', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما قيمة الرقم 4 في العدد 3,400؟', options: ['4', '40', '400', '4000'], correct: 2, explanation: 'الرقم 4 في خانة المئات = 400' },
  { id: 'q-p4-math-006', gradeKey: 'p4', subject: 'math', skill: 'الضرب', difficulty: 'hard', question: 'كم يساوي 25 × 4؟', options: ['80', '90', '100', '110'], correct: 2, explanation: '25 × 4 = 100' },
  { id: 'q-p4-math-007', gradeKey: 'p4', subject: 'math', skill: 'القياس', difficulty: 'medium', question: 'كم كيلومتراً في 3000 متر؟', options: ['3 كم', '30 كم', '300 كم', '0.3 كم'], correct: 0, explanation: '3000 متر = 3 كيلومتر' },
  { id: 'q-p4-math-008', gradeKey: 'p4', subject: 'math', skill: 'الكسور', difficulty: 'hard', question: 'ما الكسر الأكبر: 1/2 أم 3/4؟', options: ['1/2', '3/4', 'متساويان', 'لا يمكن المقارنة'], correct: 1, explanation: '3/4 = 0.75 أكبر من 1/2 = 0.5' },
  { id: 'q-p4-math-009', gradeKey: 'p4', subject: 'math', skill: 'الجمع', difficulty: 'hard', question: 'كم يساوي 1,250 + 750؟', options: ['1,900', '2,000', '2,100', '2,200'], correct: 1, explanation: '1,250 + 750 = 2,000' },
  { id: 'q-p4-math-010', gradeKey: 'p4', subject: 'math', skill: 'الهندسة', difficulty: 'hard', question: 'ما مساحة مربع طول ضلعه 9 سم؟', options: ['36 سم²', '72 سم²', '81 سم²', '90 سم²'], correct: 2, explanation: 'مساحة المربع = الضلع² = 9² = 81 سم²' },
  { id: 'q-p4-math-011', gradeKey: 'p4', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما ناتج 1000 - 375؟', options: ['615', '625', '635', '645'], correct: 1, explanation: '1000 - 375 = 625' },
  { id: 'q-p4-math-012', gradeKey: 'p4', subject: 'math', skill: 'القسمة', difficulty: 'hard', question: 'كم يساوي 144 ÷ 12؟', options: ['10', '11', '12', '13'], correct: 2, explanation: '144 ÷ 12 = 12' },

  // ===== تهيئة مهارية - خامس ابتدائي (p5) =====
  { id: 'q-p5-arabic-001', gradeKey: 'p5', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما علامة نصب الجمع المذكر السالم؟', options: ['الياء', 'الواو', 'الفتحة', 'الكسرة'], correct: 0, explanation: 'علامة نصب جمع المذكر السالم = الياء' },
  { id: 'q-p5-arabic-002', gradeKey: 'p5', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الكلمة الصحيحة: "مسؤول" أم "مسئول"؟', options: ['مسؤول', 'مسئول', 'كلتاهما صحيحة', 'كلتاهما خاطئة'], correct: 0, explanation: 'مسؤول الأكثر شيوعاً في الكتابة الحديثة' },
  { id: 'q-p5-arabic-003', gradeKey: 'p5', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما معنى كلمة "أمين"؟', options: ['خائن', 'موثوق', 'كاذب', 'ضعيف'], correct: 1, explanation: 'أمين = موثوق، يُعتمد عليه' },
  { id: 'q-p5-arabic-004', gradeKey: 'p5', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع الجملة: "الطالبُ مجتهدٌ"؟', options: ['جملة فعلية', 'جملة اسمية', 'جملة شرطية', 'جملة ظرفية'], correct: 1, explanation: 'الجملة اسمية تبدأ باسم (الطالب مبتدأ)' },
  { id: 'q-p5-arabic-005', gradeKey: 'p5', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما الفكرة الرئيسية في قصيدة تتحدث عن الوطن؟', options: ['وصف الطبيعة', 'الحب والانتماء للوطن', 'الحزن والفراق', 'المدح والثناء'], correct: 1, explanation: 'قصائد الوطن تتمحور حول الحب والانتماء' },
  { id: 'q-p5-arabic-006', gradeKey: 'p5', subject: 'arabic', skill: 'الإملاء', difficulty: 'hard', question: 'ما الصحيح: "إن" أم "أن" في الجملة: "أعلم ___ الصدق فضيلة"؟', options: ['إن', 'أن', 'كلاهما', 'لا شيء'], correct: 1, explanation: 'أن المفتوحة تأتي بعد أفعال اليقين كـ"أعلم"' },
  { id: 'q-p5-arabic-007', gradeKey: 'p5', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الفاعل في الجملة: "كتب الطالبُ الدرسَ"؟', options: ['كتب', 'الطالب', 'الدرس', 'لا فاعل'], correct: 1, explanation: 'الطالب فاعل مرفوع بالضمة' },
  { id: 'q-p5-arabic-008', gradeKey: 'p5', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما جمع كلمة "مدينة"؟', options: ['مدن', 'مدينات', 'مدائن', 'مدنيات'], correct: 0, explanation: 'جمع مدينة = مدن' },
  { id: 'q-p5-arabic-009', gradeKey: 'p5', subject: 'arabic', skill: 'القراءة', difficulty: 'hard', question: 'ما الأسلوب البلاغي في: "الوقت كالسيف"؟', options: ['استعارة', 'تشبيه', 'كناية', 'مجاز'], correct: 1, explanation: 'الوقت كالسيف = تشبيه (أداة التشبيه: الكاف)' },
  { id: 'q-p5-arabic-010', gradeKey: 'p5', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الكلمة التي فيها همزة قطع؟', options: ['اسم', 'اكتب', 'أمل', 'انتظر'], correct: 2, explanation: 'أمل تبدأ بهمزة قطع (تُكتب دائماً)' },
  { id: 'q-p5-arabic-011', gradeKey: 'p5', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما إعراب "في" في: "ذهبتُ إلى المدرسةِ"؟', options: ['حرف جر', 'حرف عطف', 'حرف نفي', 'حرف نداء'], correct: 0, explanation: 'إلى حرف جر يجر ما بعده' },
  { id: 'q-p5-arabic-012', gradeKey: 'p5', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما ضد كلمة "يقين"؟', options: ['صواب', 'شك', 'حق', 'علم'], correct: 1, explanation: 'ضد اليقين = الشك' },
  { id: 'q-p5-math-001', gradeKey: 'p5', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'كم يساوي 2/5 + 1/5؟', options: ['1/5', '2/5', '3/5', '4/5'], correct: 2, explanation: '2/5 + 1/5 = 3/5' },
  { id: 'q-p5-math-002', gradeKey: 'p5', subject: 'math', skill: 'الأعداد العشرية', difficulty: 'medium', question: 'كم يساوي 4.8 - 1.3؟', options: ['3.4', '3.5', '3.6', '3.7'], correct: 1, explanation: '4.8 - 1.3 = 3.5' },
  { id: 'q-p5-math-003', gradeKey: 'p5', subject: 'math', skill: 'الضرب', difficulty: 'hard', question: 'كم يساوي 35 × 12؟', options: ['380', '400', '420', '440'], correct: 2, explanation: '35 × 12 = 420' },
  { id: 'q-p5-math-004', gradeKey: 'p5', subject: 'math', skill: 'المساحة', difficulty: 'medium', question: 'ما مساحة مثلث قاعدته 10 سم وارتفاعه 6 سم؟', options: ['20 سم²', '30 سم²', '40 سم²', '60 سم²'], correct: 1, explanation: 'مساحة المثلث = (القاعدة × الارتفاع) ÷ 2 = 60 ÷ 2 = 30 سم²' },
  { id: 'q-p5-math-005', gradeKey: 'p5', subject: 'math', skill: 'النسبة المئوية', difficulty: 'hard', question: 'ما 20% من 150؟', options: ['20', '25', '30', '35'], correct: 2, explanation: '20% × 150 = 30' },
  { id: 'q-p5-math-006', gradeKey: 'p5', subject: 'math', skill: 'الكسور', difficulty: 'hard', question: 'كم يساوي 3/4 - 1/2؟', options: ['1/4', '2/4', '1/2', '3/8'], correct: 0, explanation: '3/4 - 2/4 = 1/4' },
  { id: 'q-p5-math-007', gradeKey: 'p5', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'كم درجة الزاوية القائمة؟', options: ['45°', '90°', '180°', '360°'], correct: 1, explanation: 'الزاوية القائمة = 90 درجة' },
  { id: 'q-p5-math-008', gradeKey: 'p5', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما المنوال (الأكثر تكراراً) في: 3، 5، 3، 7، 3، 5؟', options: ['3', '5', '7', '4'], correct: 0, explanation: 'العدد 3 تكرر 3 مرات وهو الأكثر' },
  { id: 'q-p5-math-009', gradeKey: 'p5', subject: 'math', skill: 'الأعداد العشرية', difficulty: 'hard', question: 'كم يساوي 2.5 × 4؟', options: ['8', '9', '10', '11'], correct: 2, explanation: '2.5 × 4 = 10' },
  { id: 'q-p5-math-010', gradeKey: 'p5', subject: 'math', skill: 'القسمة', difficulty: 'hard', question: 'كم يساوي 225 ÷ 15؟', options: ['13', '14', '15', '16'], correct: 2, explanation: '225 ÷ 15 = 15' },
  { id: 'q-p5-math-011', gradeKey: 'p5', subject: 'math', skill: 'الضرب', difficulty: 'medium', question: 'كم يساوي 45 × 10؟', options: ['405', '450', '4500', '45'], correct: 1, explanation: '45 × 10 = 450' },
  { id: 'q-p5-math-012', gradeKey: 'p5', subject: 'math', skill: 'القياس', difficulty: 'medium', question: 'كم غراماً في كيلوغرام واحد؟', options: ['100', '500', '1000', '10000'], correct: 2, explanation: '1 كيلوغرام = 1000 غرام' },
  { id: 'q-p5-science-001', gradeKey: 'p5', subject: 'science', skill: 'الكائنات الحية', difficulty: 'easy', question: 'ما الغاز الذي تستخدمه النباتات في عملية التمثيل الضوئي؟', options: ['الأكسجين', 'ثاني أكسيد الكربون', 'النيتروجين', 'الهيدروجين'], correct: 1, explanation: 'النباتات تمتص ثاني أكسيد الكربون وتنتج الأكسجين' },
  { id: 'q-p5-science-002', gradeKey: 'p5', subject: 'science', skill: 'المادة', difficulty: 'medium', question: 'ما حالة الماء عند درجة 0°م؟', options: ['سائل', 'غاز', 'صلب', 'بلازما'], correct: 2, explanation: 'الماء يتجمد عند 0°م ليصبح صلباً (جليد)' },
  { id: 'q-p5-science-003', gradeKey: 'p5', subject: 'science', skill: 'الفضاء', difficulty: 'medium', question: 'ما أقرب كوكب للشمس؟', options: ['الزهرة', 'الأرض', 'عطارد', 'المريخ'], correct: 2, explanation: 'عطارد أقرب كوكب للشمس' },
  { id: 'q-p5-science-004', gradeKey: 'p5', subject: 'science', skill: 'الكائنات الحية', difficulty: 'hard', question: 'ما وظيفة الكلوروفيل في النبات؟', options: ['امتصاص الماء', 'امتصاص الضوء', 'إنتاج البذور', 'تنقية الهواء'], correct: 1, explanation: 'الكلوروفيل يمتص ضوء الشمس لعملية التمثيل الضوئي' },
  { id: 'q-p5-science-005', gradeKey: 'p5', subject: 'science', skill: 'المادة', difficulty: 'medium', question: 'ما الذي يحدث للمعادن عند تسخينها؟', options: ['تنكمش', 'تتمدد', 'تذوب', 'تتبخر'], correct: 1, explanation: 'المعادن تتمدد عند التسخين وتنكمش عند التبريد' },

  // ===== تهيئة مهارية - أول متوسط (m1) =====
  { id: 'q-m1-arabic-001', gradeKey: 'm1', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما المبتدأ في الجملة: "العلمُ نورٌ"؟', options: ['نور', 'العلم', 'لا مبتدأ', 'كلاهما'], correct: 1, explanation: 'العلم مبتدأ مرفوع بالضمة' },
  { id: 'q-m1-arabic-002', gradeKey: 'm1', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الأسلوب البلاغي في: "الجهل ظلام"؟', options: ['تشبيه', 'استعارة', 'كناية', 'مجاز مرسل'], correct: 0, explanation: 'الجهل ظلام = تشبيه بليغ (حذفت أداة التشبيه ووجه الشبه)' },
  { id: 'q-m1-arabic-003', gradeKey: 'm1', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الصحيح في كتابة همزة الوصل؟', options: ['تُكتب دائماً', 'لا تُكتب في وسط الكلام', 'تُكتب في أول الكلام فقط', 'لا تُكتب أبداً'], correct: 1, explanation: 'همزة الوصل لا تُنطق ولا تُكتب في وسط الكلام' },
  { id: 'q-m1-arabic-004', gradeKey: 'm1', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما علامة جزم الفعل المضارع الصحيح الآخر؟', options: ['الفتحة', 'الكسرة', 'السكون', 'الضمة'], correct: 2, explanation: 'الفعل المضارع الصحيح الآخر يُجزم بالسكون' },
  { id: 'q-m1-arabic-005', gradeKey: 'm1', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما مرادف كلمة "الفصاحة"؟', options: ['الصمت', 'البلاغة', 'الجهل', 'الكذب'], correct: 1, explanation: 'الفصاحة = البلاغة في الكلام' },
  { id: 'q-m1-arabic-006', gradeKey: 'm1', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع "لا" في: "لا تكذب"؟', options: ['لا النافية', 'لا الناهية', 'لا النافية للجنس', 'لا الزائدة'], correct: 1, explanation: 'لا الناهية تجزم الفعل المضارع' },
  { id: 'q-m1-arabic-007', gradeKey: 'm1', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الاستعارة في: "رأيتُ أسداً يخطب"؟', options: ['تشبيه الخطيب بالأسد', 'مدح الأسد', 'وصف الأسد', 'لا استعارة'], correct: 0, explanation: 'استعارة تصريحية: شُبّه الخطيب بالأسد وحُذف المشبه' },
  { id: 'q-m1-arabic-008', gradeKey: 'm1', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما جمع كلمة "قصيدة"؟', options: ['قصائد', 'قصيدات', 'أقاصيد', 'قصيد'], correct: 0, explanation: 'جمع قصيدة = قصائد' },
  { id: 'q-m1-arabic-009', gradeKey: 'm1', subject: 'arabic', skill: 'القراءة', difficulty: 'medium', question: 'ما الغرض من أسلوب الاستفهام في الشعر؟', options: ['الاستفسار الحقيقي', 'التعجب والتأكيد', 'النهي', 'الأمر'], correct: 1, explanation: 'الاستفهام في الشعر غالباً للتعجب والتأكيد لا للاستفسار' },
  { id: 'q-m1-arabic-010', gradeKey: 'm1', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الصحيح: "يتعلّم" أم "يتعلم"؟', options: ['يتعلّم (بالتشديد)', 'يتعلم (بدون تشديد)', 'كلاهما صحيح', 'كلاهما خاطئ'], correct: 0, explanation: 'يتعلّم بالتشديد لأن الأصل تعلّم بتضعيف اللام' },
  { id: 'q-m1-arabic-011', gradeKey: 'm1', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الحال في: "جاء الطالبُ مسرعاً"؟', options: ['جاء', 'الطالب', 'مسرعاً', 'لا حال'], correct: 2, explanation: 'مسرعاً حال منصوب يبين هيئة الطالب' },
  { id: 'q-m1-arabic-012', gradeKey: 'm1', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما ضد كلمة "الإقدام"؟', options: ['الشجاعة', 'الإحجام', 'التقدم', 'النجاح'], correct: 1, explanation: 'ضد الإقدام = الإحجام (التراجع)' },
  { id: 'q-m1-math-001', gradeKey: 'm1', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'إذا كان 2x = 10، فما قيمة x؟', options: ['3', '4', '5', '6'], correct: 2, explanation: 'x = 10 ÷ 2 = 5' },
  { id: 'q-m1-math-002', gradeKey: 'm1', subject: 'math', skill: 'الأعداد الصحيحة', difficulty: 'medium', question: 'كم يساوي (-3) + 7؟', options: ['-4', '4', '-10', '10'], correct: 1, explanation: '(-3) + 7 = 4' },
  { id: 'q-m1-math-003', gradeKey: 'm1', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'ما مجموع زوايا المضلع الرباعي؟', options: ['180°', '270°', '360°', '540°'], correct: 2, explanation: 'مجموع زوايا المضلع الرباعي = 360 درجة' },
  { id: 'q-m1-math-004', gradeKey: 'm1', subject: 'math', skill: 'النسبة والتناسب', difficulty: 'hard', question: 'إذا كانت نسبة أ:ب = 3:5 وأ = 12، فما قيمة ب؟', options: ['15', '18', '20', '25'], correct: 2, explanation: '3/5 = 12/ب → ب = 12 × 5/3 = 20' },
  { id: 'q-m1-math-005', gradeKey: 'm1', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'كم يساوي 5/6 ÷ 5/3؟', options: ['1/2', '2/3', '1', '3/2'], correct: 0, explanation: '5/6 ÷ 5/3 = 5/6 × 3/5 = 15/30 = 1/2' },
  { id: 'q-m1-math-006', gradeKey: 'm1', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما قيمة x في: 3x - 4 = 11؟', options: ['4', '5', '6', '7'], correct: 1, explanation: '3x = 15 → x = 5' },
  { id: 'q-m1-math-007', gradeKey: 'm1', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما الوسيط في: 2، 4، 6، 8، 10؟', options: ['4', '5', '6', '7'], correct: 2, explanation: 'الوسيط = القيمة الوسطى = 6' },
  { id: 'q-m1-math-008', gradeKey: 'm1', subject: 'math', skill: 'الأعداد الصحيحة', difficulty: 'hard', question: 'كم يساوي (-5) × (-4)؟', options: ['-20', '-9', '9', '20'], correct: 3, explanation: 'سالب × سالب = موجب: (-5) × (-4) = 20' },
  { id: 'q-m1-math-009', gradeKey: 'm1', subject: 'math', skill: 'الهندسة', difficulty: 'hard', question: 'ما محيط دائرة نصف قطرها 7 سم؟ (π ≈ 22/7)', options: ['22 سم', '44 سم', '66 سم', '154 سم'], correct: 1, explanation: 'المحيط = 2πr = 2 × 22/7 × 7 = 44 سم' },
  { id: 'q-m1-math-010', gradeKey: 'm1', subject: 'math', skill: 'الكسور', difficulty: 'medium', question: 'كم يساوي 1 1/2 + 2 1/4؟', options: ['3 1/4', '3 1/2', '3 3/4', '4'], correct: 2, explanation: '1.5 + 2.25 = 3.75 = 3 3/4' },
  { id: 'q-m1-math-011', gradeKey: 'm1', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما قيمة التعبير 2a + 3b عندما a=2 وb=3؟', options: ['11', '12', '13', '14'], correct: 2, explanation: '2(2) + 3(3) = 4 + 9 = 13' },
  { id: 'q-m1-math-012', gradeKey: 'm1', subject: 'math', skill: 'النسبة المئوية', difficulty: 'medium', question: 'ما 15% من 200؟', options: ['25', '30', '35', '40'], correct: 1, explanation: '15% × 200 = 30' },
  { id: 'q-m1-science-001', gradeKey: 'm1', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما الصيغة الكيميائية للماء؟', options: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1, explanation: 'الماء = H2O (ذرتا هيدروجين وذرة أكسجين)' },
  { id: 'q-m1-science-002', gradeKey: 'm1', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما وحدة قياس القوة؟', options: ['جول', 'واط', 'نيوتن', 'باسكال'], correct: 2, explanation: 'وحدة القوة = النيوتن (N)' },
  { id: 'q-m1-science-003', gradeKey: 'm1', subject: 'science', skill: 'الأحياء', difficulty: 'easy', question: 'ما الوحدة الأساسية للكائن الحي؟', options: ['الأنسجة', 'الخلية', 'الجهاز', 'العضو'], correct: 1, explanation: 'الخلية هي الوحدة الأساسية لجميع الكائنات الحية' },
  { id: 'q-m1-science-004', gradeKey: 'm1', subject: 'science', skill: 'الكيمياء', difficulty: 'hard', question: 'ما عدد البروتونات في ذرة الأكسجين؟', options: ['6', '7', '8', '9'], correct: 2, explanation: 'الأكسجين عدده الذري 8 أي له 8 بروتونات' },
  { id: 'q-m1-science-005', gradeKey: 'm1', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما سرعة الضوء تقريباً؟', options: ['300 كم/ث', '3000 كم/ث', '300,000 كم/ث', '3,000,000 كم/ث'], correct: 2, explanation: 'سرعة الضوء ≈ 300,000 كيلومتر في الثانية' },

  // ===== تهيئة مهارية - ثاني متوسط (m2) =====
  { id: 'q-m2-arabic-001', gradeKey: 'm2', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما إعراب "خيراً" في: "إن تجتهد تلقَ خيراً"؟', options: ['مفعول به', 'حال', 'تمييز', 'خبر'], correct: 0, explanation: 'خيراً مفعول به منصوب للفعل تلقَ' },
  { id: 'q-m2-arabic-002', gradeKey: 'm2', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الكناية في: "فلان طويل النجاد"؟', options: ['طول القامة', 'طول السيف', 'كثرة المال', 'الشجاعة'], correct: 0, explanation: 'طويل النجاد كناية عن طول القامة' },
  { id: 'q-m2-arabic-003', gradeKey: 'm2', subject: 'arabic', skill: 'الإملاء', difficulty: 'medium', question: 'ما الصحيح: "لا أحد" أم "لاأحد"؟', options: ['لا أحد (منفصلة)', 'لاأحد (متصلة)', 'كلاهما', 'لا شيء'], correct: 0, explanation: 'لا النافية تُكتب منفصلة عما بعدها' },
  { id: 'q-m2-arabic-004', gradeKey: 'm2', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع الجملة بعد "أن" في: "أريد أن أتعلم"؟', options: ['اسمية', 'فعلية في محل نصب', 'فعلية في محل رفع', 'فعلية مستقلة'], correct: 1, explanation: 'أن وما بعدها في محل نصب مفعول به' },
  { id: 'q-m2-arabic-005', gradeKey: 'm2', subject: 'arabic', skill: 'المفردات', difficulty: 'medium', question: 'ما مرادف كلمة "الإبداع"؟', options: ['التقليد', 'الابتكار', 'الإتقان', 'التكرار'], correct: 1, explanation: 'الإبداع = الابتكار (خلق شيء جديد)' },
  { id: 'q-m2-arabic-006', gradeKey: 'm2', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما الطباق في: "يُحيي ويُميت"؟', options: ['تشبيه', 'طباق إيجاب', 'طباق سلب', 'مقابلة'], correct: 1, explanation: 'طباق إيجاب بين يُحيي ويُميت (ضدان بدون نفي)' },
  { id: 'q-m2-arabic-007', gradeKey: 'm2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الفعل المبني للمجهول من "كتب"؟', options: ['كاتب', 'مكتوب', 'كُتب', 'يكتب'], correct: 2, explanation: 'المبني للمجهول من كتب = كُتب' },
  { id: 'q-m2-arabic-008', gradeKey: 'm2', subject: 'arabic', skill: 'القراءة', difficulty: 'hard', question: 'ما الفرق بين الشعر العمودي والشعر الحر؟', options: ['لا فرق', 'الشعر الحر لا يلتزم بالوزن والقافية', 'الشعر العمودي أحدث', 'الشعر الحر أقدم'], correct: 1, explanation: 'الشعر الحر لا يلتزم بالوزن والقافية الثابتة' },
  { id: 'q-m2-arabic-009', gradeKey: 'm2', subject: 'arabic', skill: 'الإملاء', difficulty: 'hard', question: 'ما الصحيح: "مئة" أم "مائة"؟', options: ['مئة فقط', 'مائة فقط', 'كلتاهما صحيحتان', 'كلتاهما خاطئتان'], correct: 2, explanation: 'كلتا الكتابتين صحيحتان في اللغة العربية' },
  { id: 'q-m2-arabic-010', gradeKey: 'm2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما المفعول المطلق في: "اجتهدتُ اجتهاداً"؟', options: ['اجتهدتُ', 'اجتهاداً', 'لا مفعول مطلق', 'كلاهما'], correct: 1, explanation: 'اجتهاداً مفعول مطلق منصوب بالفتحة' },
  { id: 'q-m2-arabic-011', gradeKey: 'm2', subject: 'arabic', skill: 'المفردات', difficulty: 'easy', question: 'ما ضد كلمة "الغموض"؟', options: ['الظلام', 'الوضوح', 'الصعوبة', 'الجهل'], correct: 1, explanation: 'ضد الغموض = الوضوح' },
  { id: 'q-m2-arabic-012', gradeKey: 'm2', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما المجاز في: "تكلّم الجدارُ"؟', options: ['تشبيه', 'كناية', 'مجاز عقلي', 'استعارة'], correct: 2, explanation: 'إسناد الكلام للجدار مجاز عقلي' },
  { id: 'q-m2-math-001', gradeKey: 'm2', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما ناتج (x+2)(x-2)؟', options: ['x²-4', 'x²+4', 'x²-2x+4', 'x²+2x-4'], correct: 0, explanation: '(a+b)(a-b) = a²-b² → (x+2)(x-2) = x²-4' },
  { id: 'q-m2-math-002', gradeKey: 'm2', subject: 'math', skill: 'الهندسة', difficulty: 'hard', question: 'ما مساحة دائرة نصف قطرها 5 سم؟ (π ≈ 3.14)', options: ['15.7 سم²', '31.4 سم²', '78.5 سم²', '157 سم²'], correct: 2, explanation: 'المساحة = πr² = 3.14 × 25 = 78.5 سم²' },
  { id: 'q-m2-math-003', gradeKey: 'm2', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما المتوسط الحسابي للأعداد: 5، 10، 15، 20؟', options: ['10', '12', '12.5', '15'], correct: 2, explanation: '(5+10+15+20) ÷ 4 = 50 ÷ 4 = 12.5' },
  { id: 'q-m2-math-004', gradeKey: 'm2', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما حل المعادلة: 2x + 5 = 15؟', options: ['x=4', 'x=5', 'x=6', 'x=7'], correct: 1, explanation: '2x = 10 → x = 5' },
  { id: 'q-m2-math-005', gradeKey: 'm2', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما ناتج 2³ × 2²؟', options: ['2⁴', '2⁵', '2⁶', '4⁵'], correct: 1, explanation: '2³ × 2² = 2^(3+2) = 2⁵ = 32' },
  { id: 'q-m2-math-006', gradeKey: 'm2', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'في مثلث قائم الزاوية، ما العلاقة بين الأضلاع؟', options: ['أ² = ب² - ج²', 'أ² + ب² = ج²', 'أ + ب = ج', 'أ × ب = ج²'], correct: 1, explanation: 'نظرية فيثاغورس: مجموع مربعي الضلعين = مربع الوتر' },
  { id: 'q-m2-math-007', gradeKey: 'm2', subject: 'math', skill: 'الاحتمالات', difficulty: 'hard', question: 'ما احتمال ظهور عدد زوجي عند رمي حجر نرد؟', options: ['1/6', '1/3', '1/2', '2/3'], correct: 2, explanation: 'الأعداد الزوجية: 2،4،6 = 3 من أصل 6 → 1/2' },
  { id: 'q-m2-math-008', gradeKey: 'm2', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما قيمة x² + y² إذا كان x=3 وy=4؟', options: ['7', '14', '25', '49'], correct: 2, explanation: '3² + 4² = 9 + 16 = 25' },
  { id: 'q-m2-math-009', gradeKey: 'm2', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما المدى في: 3، 8، 12، 5، 9؟', options: ['6', '7', '8', '9'], correct: 3, explanation: 'المدى = الأكبر - الأصغر = 12 - 3 = 9' },
  { id: 'q-m2-math-010', gradeKey: 'm2', subject: 'math', skill: 'الأعداد', difficulty: 'medium', question: 'ما الجذر التربيعي لـ 144؟', options: ['10', '11', '12', '13'], correct: 2, explanation: '√144 = 12 لأن 12 × 12 = 144' },
  { id: 'q-m2-math-011', gradeKey: 'm2', subject: 'math', skill: 'الهندسة', difficulty: 'medium', question: 'ما حجم مكعب طول ضلعه 4 سم؟', options: ['16 سم³', '48 سم³', '64 سم³', '96 سم³'], correct: 2, explanation: 'حجم المكعب = الضلع³ = 4³ = 64 سم³' },
  { id: 'q-m2-math-012', gradeKey: 'm2', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما ناتج (3x)² ؟', options: ['3x²', '6x²', '9x²', '9x'], correct: 2, explanation: '(3x)² = 9x²' },
  { id: 'q-m2-science-001', gradeKey: 'm2', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما نوع التفاعل الذي يُنتج حرارة؟', options: ['تفاعل ماص للحرارة', 'تفاعل طارد للحرارة', 'تفاعل محايد', 'تفاعل بطيء'], correct: 1, explanation: 'التفاعل الطارد للحرارة (Exothermic) يُطلق طاقة حرارية' },
  { id: 'q-m2-science-002', gradeKey: 'm2', subject: 'science', skill: 'الفيزياء', difficulty: 'hard', question: 'ما قانون نيوتن الثاني؟', options: ['F = ma', 'E = mc²', 'PV = nRT', 'F = kx'], correct: 0, explanation: 'القانون الثاني لنيوتن: القوة = الكتلة × التسارع' },
  { id: 'q-m2-science-003', gradeKey: 'm2', subject: 'science', skill: 'الأحياء', difficulty: 'medium', question: 'ما وظيفة الميتوكوندريا في الخلية؟', options: ['تخزين الغذاء', 'إنتاج الطاقة', 'التكاثر', 'الهضم'], correct: 1, explanation: 'الميتوكوندريا = مصنع الطاقة في الخلية' },
  { id: 'q-m2-science-004', gradeKey: 'm2', subject: 'science', skill: 'الكيمياء', difficulty: 'medium', question: 'ما الرقم الهيدروجيني للماء النقي؟', options: ['0', '5', '7', '14'], correct: 2, explanation: 'الماء النقي محايد: pH = 7' },
  { id: 'q-m2-science-005', gradeKey: 'm2', subject: 'science', skill: 'الفيزياء', difficulty: 'medium', question: 'ما وحدة قياس الشغل؟', options: ['نيوتن', 'واط', 'جول', 'باسكال'], correct: 2, explanation: 'وحدة الشغل = الجول (J)' },

  // ===== تهيئة مهارية - أول ثانوي (s1) =====
  { id: 'q-s1-arabic-001', gradeKey: 's1', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما نوع الخبر في: "الطالبُ في الفصلِ"؟', options: ['مفرد', 'جملة اسمية', 'جملة فعلية', 'شبه جملة'], correct: 3, explanation: 'الخبر شبه جملة (جار ومجرور)' },
  { id: 'q-s1-arabic-002', gradeKey: 's1', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الفرق بين الاستعارة التصريحية والمكنية؟', options: ['لا فرق', 'التصريحية: ذُكر المشبه به، المكنية: ذُكر المشبه', 'التصريحية أقدم', 'المكنية أبلغ دائماً'], correct: 1, explanation: 'التصريحية: حُذف المشبه وصُرّح بالمشبه به. المكنية: حُذف المشبه به وبقيت لازمته' },
  { id: 'q-s1-arabic-003', gradeKey: 's1', subject: 'arabic', skill: 'الأدب', difficulty: 'medium', question: 'من أبرز شعراء العصر الجاهلي؟', options: ['المتنبي', 'امرؤ القيس', 'أبو نواس', 'البحتري'], correct: 1, explanation: 'امرؤ القيس من أبرز شعراء العصر الجاهلي' },
  { id: 'q-s1-arabic-004', gradeKey: 's1', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما المصدر المؤول في: "أريد أن أنجح"؟', options: ['أريد', 'أن أنجح', 'أنجح', 'لا مصدر مؤول'], correct: 1, explanation: 'أن أنجح = مصدر مؤول في محل نصب مفعول به' },
  { id: 'q-s1-arabic-005', gradeKey: 's1', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما المحسّن البديعي في: "يُحيي ويُميت، ويُضحك ويُبكي"؟', options: ['طباق', 'مقابلة', 'جناس', 'تورية'], correct: 1, explanation: 'المقابلة: مقابلة جملتين أو أكثر بالضد' },
  { id: 'q-s1-arabic-006', gradeKey: 's1', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الفعل الناقص في: "كان الطالبُ مجتهداً"؟', options: ['الطالب', 'مجتهداً', 'كان', 'لا فعل ناقص'], correct: 2, explanation: 'كان فعل ناقص يرفع الاسم وينصب الخبر' },
  { id: 'q-s1-arabic-007', gradeKey: 's1', subject: 'arabic', skill: 'الأدب', difficulty: 'medium', question: 'ما أبرز أغراض الشعر الجاهلي؟', options: ['الغزل فقط', 'الفخر والمدح والرثاء والهجاء', 'الوصف فقط', 'الحكمة فقط'], correct: 1, explanation: 'أغراض الشعر الجاهلي: الفخر، المدح، الرثاء، الهجاء، الغزل، الوصف' },
  { id: 'q-s1-arabic-008', gradeKey: 's1', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما الجناس في: "سل السيل عن السيل"؟', options: ['جناس تام', 'جناس ناقص', 'طباق', 'مقابلة'], correct: 0, explanation: 'جناس تام: تشابه الكلمتين في النوع والعدد والهيئة والترتيب' },
  { id: 'q-s1-arabic-009', gradeKey: 's1', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما إعراب "لو" في: "لو اجتهدتَ لنجحتَ"؟', options: ['حرف شرط', 'حرف جزم', 'حرف نصب', 'حرف نفي'], correct: 0, explanation: 'لو حرف شرط غير جازم يفيد الامتناع للامتناع' },
  { id: 'q-s1-arabic-010', gradeKey: 's1', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'ما أبرز ما يميز شعر المتنبي؟', options: ['السهولة والبساطة', 'الفخر والحكمة والعمق', 'الغزل العذري', 'وصف الطبيعة فقط'], correct: 1, explanation: 'شعر المتنبي يتميز بالفخر والحكمة والعمق الفلسفي' },
  { id: 'q-s1-arabic-011', gradeKey: 's1', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما نائب الفاعل في: "كُتب الدرسُ"؟', options: ['كُتب', 'الدرس', 'لا نائب فاعل', 'كلاهما'], correct: 1, explanation: 'الدرس نائب فاعل مرفوع بالضمة' },
  { id: 'q-s1-arabic-012', gradeKey: 's1', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما التشبيه الضمني في: "من يزرع الخير يحصد السعادة"؟', options: ['لا تشبيه', 'تشبيه الخير بالزرع والسعادة بالحصاد', 'استعارة', 'كناية'], correct: 1, explanation: 'تشبيه ضمني: لم تُذكر أداة التشبيه صراحةً' },
  { id: 'q-s1-math-001', gradeKey: 's1', subject: 'math', skill: 'الدوال', difficulty: 'hard', question: 'إذا كانت f(x) = 2x + 3، فما قيمة f(4)؟', options: ['9', '10', '11', '12'], correct: 2, explanation: 'f(4) = 2(4) + 3 = 8 + 3 = 11' },
  { id: 'q-s1-math-002', gradeKey: 's1', subject: 'math', skill: 'المثلثات', difficulty: 'hard', question: 'في مثلث قائم، sin(30°) = ؟', options: ['√3/2', '1/2', '1/√2', '√3'], correct: 1, explanation: 'sin(30°) = 1/2' },
  { id: 'q-s1-math-003', gradeKey: 's1', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما ناتج تحليل x² - 9؟', options: ['(x-3)²', '(x+3)(x-3)', '(x+9)(x-1)', '(x-9)(x+1)'], correct: 1, explanation: 'x² - 9 = (x+3)(x-3) بقاعدة الفرق بين مربعين' },
  { id: 'q-s1-math-004', gradeKey: 's1', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما الانحراف المعياري إذا كانت التباين = 16؟', options: ['2', '4', '8', '256'], correct: 1, explanation: 'الانحراف المعياري = √التباين = √16 = 4' },
  { id: 'q-s1-math-005', gradeKey: 's1', subject: 'math', skill: 'الهندسة', difficulty: 'hard', question: 'ما معادلة الدائرة ذات المركز (0,0) ونصف القطر 5؟', options: ['x+y=5', 'x²+y²=5', 'x²+y²=25', 'x²-y²=25'], correct: 2, explanation: 'معادلة الدائرة: x²+y²=r² = 5² = 25' },
  { id: 'q-s1-math-006', gradeKey: 's1', subject: 'math', skill: 'الدوال', difficulty: 'medium', question: 'ما ميل الخط الذي يمر بالنقطتين (1,2) و(3,6)؟', options: ['1', '2', '3', '4'], correct: 1, explanation: 'الميل = (6-2)/(3-1) = 4/2 = 2' },
  { id: 'q-s1-math-007', gradeKey: 's1', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما حل المعادلة x² - 5x + 6 = 0؟', options: ['x=1,6', 'x=2,3', 'x=-2,-3', 'x=1,5'], correct: 1, explanation: 'x² - 5x + 6 = (x-2)(x-3) = 0 → x=2 أو x=3' },
  { id: 'q-s1-math-008', gradeKey: 's1', subject: 'math', skill: 'المثلثات', difficulty: 'medium', question: 'cos(60°) = ؟', options: ['√3/2', '1/2', '1/√2', '1'], correct: 1, explanation: 'cos(60°) = 1/2' },
  { id: 'q-s1-math-009', gradeKey: 's1', subject: 'math', skill: 'الاحتمالات', difficulty: 'hard', question: 'ما عدد ترتيبات 4 أشخاص في صف؟', options: ['12', '16', '24', '48'], correct: 2, explanation: '4! = 4×3×2×1 = 24' },
  { id: 'q-s1-math-010', gradeKey: 's1', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما ناتج (2x-3)²؟', options: ['4x²-9', '4x²+9', '4x²-12x+9', '4x²+12x+9'], correct: 2, explanation: '(a-b)² = a²-2ab+b² → (2x-3)² = 4x²-12x+9' },
  { id: 'q-s1-math-011', gradeKey: 's1', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما الوسيط في: 1، 3، 5، 7، 9، 11؟', options: ['5', '6', '7', '8'], correct: 1, explanation: 'الوسيط = (5+7)/2 = 6' },
  { id: 'q-s1-math-012', gradeKey: 's1', subject: 'math', skill: 'الدوال', difficulty: 'hard', question: 'ما مجال الدالة f(x) = √(x-2)؟', options: ['x > 2', 'x ≥ 2', 'x < 2', 'جميع الأعداد'], correct: 1, explanation: 'لكي يكون الجذر معرّفاً: x - 2 ≥ 0 → x ≥ 2' },

  // ===== تهيئة مهارية - ثاني ثانوي (s2) =====
  { id: 'q-s2-arabic-001', gradeKey: 's2', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'ما أبرز ما يميز الأدب في العصر العباسي؟', options: ['البساطة والسهولة', 'التجديد والتأثر بالثقافات الأخرى', 'الالتزام بالقديم', 'الشعر الحربي فقط'], correct: 1, explanation: 'العصر العباسي تميز بالتجديد والتأثر بالثقافة الفارسية واليونانية' },
  { id: 'q-s2-arabic-002', gradeKey: 's2', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الأسلوب في: "لعل الفرج قريب"؟', options: ['ترجٍّ', 'إشفاق', 'تمنٍّ', 'تعجب'], correct: 0, explanation: 'لعل تفيد الترجي (توقع الأمر المحبوب)' },
  { id: 'q-s2-arabic-003', gradeKey: 's2', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الفرق بين الحقيقة والمجاز؟', options: ['لا فرق', 'الحقيقة: اللفظ في معناه الأصلي، المجاز: في غير معناه الأصلي', 'المجاز أقدم', 'الحقيقة أبلغ'], correct: 1, explanation: 'الحقيقة: اللفظ في موضعه الأصلي. المجاز: اللفظ في غير موضعه لعلاقة' },
  { id: 'q-s2-arabic-004', gradeKey: 's2', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الاشتغال في: "زيداً ضربتُه"؟', options: ['لا اشتغال', 'ضُرب زيد واشتغل الفعل بضميره', 'زيد فاعل', 'زيد مبتدأ'], correct: 1, explanation: 'الاشتغال: تقدّم اسم واشتغل الفعل بضميره' },
  { id: 'q-s2-arabic-005', gradeKey: 's2', subject: 'arabic', skill: 'الأدب', difficulty: 'medium', question: 'من أبرز كتّاب القصة القصيرة في الأدب العربي الحديث؟', options: ['المتنبي', 'يوسف إدريس', 'امرؤ القيس', 'الجاحظ'], correct: 1, explanation: 'يوسف إدريس من أبرز كتّاب القصة القصيرة في الأدب العربي' },
  { id: 'q-s2-arabic-006', gradeKey: 's2', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما التورية في: "رأيتُ بدراً يسير"؟', options: ['لا تورية', 'البدر يحتمل القمر والشخص المسمى بدراً', 'استعارة', 'كناية'], correct: 1, explanation: 'التورية: لفظ له معنيان قريب وبعيد، والمقصود البعيد' },
  { id: 'q-s2-arabic-007', gradeKey: 's2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الأداة التي تنصب المضارع وتجزم الشرط والجواب؟', options: ['أن', 'لن', 'إن', 'لم'], correct: 2, explanation: 'إن الشرطية تجزم فعلين: فعل الشرط وجوابه' },
  { id: 'q-s2-arabic-008', gradeKey: 's2', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'ما أبرز سمات الرواية العربية الحديثة؟', options: ['قِصَر الحجم', 'التعقيد في الحبكة وتعدد الشخصيات', 'الشعر المنثور', 'الاقتباس من التراث فقط'], correct: 1, explanation: 'الرواية الحديثة تتميز بتعقيد الحبكة وتعدد الشخصيات والأبعاد النفسية' },
  { id: 'q-s2-arabic-009', gradeKey: 's2', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الفرق بين المجاز المرسل والاستعارة؟', options: ['لا فرق', 'المجاز المرسل علاقته غير المشابهة، الاستعارة علاقتها المشابهة', 'الاستعارة أقدم', 'المجاز المرسل أبلغ'], correct: 1, explanation: 'الاستعارة مجاز علاقته المشابهة، المجاز المرسل علاقته غير المشابهة' },
  { id: 'q-s2-arabic-010', gradeKey: 's2', subject: 'arabic', skill: 'النحو', difficulty: 'medium', question: 'ما الأسلوب في: "ما أجمل السماء!"؟', options: ['نفي', 'استفهام', 'تعجب', 'أمر'], correct: 2, explanation: 'ما أجمل = أسلوب تعجب' },
  { id: 'q-s2-arabic-011', gradeKey: 's2', subject: 'arabic', skill: 'الأدب', difficulty: 'medium', question: 'ما الفرق بين الشعر والنثر؟', options: ['لا فرق', 'الشعر موزون مقفى، النثر غير موزون', 'النثر أقدم', 'الشعر أسهل'], correct: 1, explanation: 'الشعر موزون ومقفى، النثر كلام غير موزون' },
  { id: 'q-s2-arabic-012', gradeKey: 's2', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما الإطناب في الكلام؟', options: ['الاختصار الشديد', 'زيادة اللفظ على المعنى لفائدة', 'الغموض', 'التكرار بلا فائدة'], correct: 1, explanation: 'الإطناب: زيادة اللفظ على المعنى لفائدة بلاغية' },
  { id: 'q-s2-math-001', gradeKey: 's2', subject: 'math', skill: 'حساب المثلثات', difficulty: 'hard', question: 'ما قيمة tan(45°)؟', options: ['0', '1/2', '1', '√3'], correct: 2, explanation: 'tan(45°) = 1' },
  { id: 'q-s2-math-002', gradeKey: 's2', subject: 'math', skill: 'التفاضل', difficulty: 'hard', question: 'ما مشتقة f(x) = x³؟', options: ['x²', '2x²', '3x²', '3x³'], correct: 2, explanation: 'مشتقة xⁿ = n·xⁿ⁻¹ → مشتقة x³ = 3x²' },
  { id: 'q-s2-math-003', gradeKey: 's2', subject: 'math', skill: 'الجبر', difficulty: 'hard', question: 'ما المصفوفة المحايدة للضرب؟', options: ['مصفوفة الأصفار', 'مصفوفة الوحدة', 'المصفوفة المعكوسة', 'المصفوفة المنقولة'], correct: 1, explanation: 'مصفوفة الوحدة (I) هي المحايدة للضرب: A×I = A' },
  { id: 'q-s2-math-004', gradeKey: 's2', subject: 'math', skill: 'التفاضل', difficulty: 'hard', question: 'ما مشتقة sin(x)؟', options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'], correct: 1, explanation: 'مشتقة sin(x) = cos(x)' },
  { id: 'q-s2-math-005', gradeKey: 's2', subject: 'math', skill: 'حساب المثلثات', difficulty: 'medium', question: 'ما قانون الجيب؟', options: ['a/sinA = b/sinB = c/sinC', 'a² = b² + c²', 'a² = b² + c² - 2bc·cosA', 'sinA = a/c'], correct: 0, explanation: 'قانون الجيب: a/sinA = b/sinB = c/sinC' },
  { id: 'q-s2-math-006', gradeKey: 's2', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما محدد المصفوفة [[2,1],[3,4]]؟', options: ['5', '8', '11', '-5'], correct: 0, explanation: 'المحدد = (2×4) - (1×3) = 8 - 3 = 5' },
  { id: 'q-s2-math-007', gradeKey: 's2', subject: 'math', skill: 'التفاضل', difficulty: 'hard', question: 'ما مشتقة e^x؟', options: ['x·e^(x-1)', 'e^x', 'ln(x)', '1/x'], correct: 1, explanation: 'مشتقة e^x = e^x (الدالة تساوي مشتقتها)' },
  { id: 'q-s2-math-008', gradeKey: 's2', subject: 'math', skill: 'حساب المثلثات', difficulty: 'hard', question: 'ما قيمة sin²(x) + cos²(x)؟', options: ['0', '1/2', '1', '2'], correct: 2, explanation: 'sin²(x) + cos²(x) = 1 (هوية مثلثية أساسية)' },
  { id: 'q-s2-math-009', gradeKey: 's2', subject: 'math', skill: 'الإحصاء', difficulty: 'medium', question: 'ما قاعدة الضرب في الاحتمال للأحداث المستقلة؟', options: ['P(A∪B) = P(A)+P(B)', 'P(A∩B) = P(A)×P(B)', 'P(A|B) = P(A)', 'P(A) = 1-P(Ā)'], correct: 1, explanation: 'للأحداث المستقلة: P(A∩B) = P(A) × P(B)' },
  { id: 'q-s2-math-010', gradeKey: 's2', subject: 'math', skill: 'الجبر', difficulty: 'medium', question: 'ما رتبة المصفوفة [[1,2,3],[4,5,6]]؟', options: ['2×2', '2×3', '3×2', '3×3'], correct: 1, explanation: 'المصفوفة لها صفان و3 أعمدة → رتبتها 2×3' },
  { id: 'q-s2-math-011', gradeKey: 's2', subject: 'math', skill: 'التفاضل', difficulty: 'hard', question: 'ما مشتقة ln(x)؟', options: ['x', '1/x', 'e^x', 'ln(x)/x'], correct: 1, explanation: 'مشتقة ln(x) = 1/x' },
  { id: 'q-s2-math-012', gradeKey: 's2', subject: 'math', skill: 'حساب المثلثات', difficulty: 'medium', question: 'ما قانون جيب التمام؟', options: ['a/sinA = b/sinB', 'a² = b² + c² - 2bc·cosA', 'sinA = a/c', 'cosA = sinA/tanA'], correct: 1, explanation: 'قانون جيب التمام: a² = b² + c² - 2bc·cosA' },

  // ===== تهيئة مهارية - ثالث ثانوي (s3) =====
  { id: 'q-s3-arabic-001', gradeKey: 's3', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'ما أبرز مدارس الشعر العربي الحديث؟', options: ['مدرسة واحدة فقط', 'مدرسة الإحياء، الرومانسية، الواقعية، الشعر الحر', 'مدرسة الكلاسيكية فقط', 'لا مدارس في الشعر الحديث'], correct: 1, explanation: 'مدارس الشعر الحديث: الإحياء والبعث، الرومانسية، الواقعية، الشعر الحر' },
  { id: 'q-s3-arabic-002', gradeKey: 's3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الأسلوب في: "أقسمُ باللهِ لأجتهدنَّ"؟', options: ['نفي', 'قسم', 'شرط', 'تعجب'], correct: 1, explanation: 'أسلوب القسم: يتكون من فعل القسم والمقسم به وجواب القسم' },
  { id: 'q-s3-arabic-003', gradeKey: 's3', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما الفرق بين الإيجاز والإطناب والمساواة؟', options: ['لا فرق', 'الإيجاز: أقل ألفاظ، الإطناب: زيادة لفائدة، المساواة: توازن', 'المساواة أفضل دائماً', 'الإيجاز أبلغ دائماً'], correct: 1, explanation: 'الإيجاز: اللفظ أقل من المعنى. الإطناب: اللفظ أكثر لفائدة. المساواة: توازن بينهما' },
  { id: 'q-s3-arabic-004', gradeKey: 's3', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'من أبرز رواد مدرسة الديوان؟', options: ['المتنبي وأبو تمام', 'العقاد والمازني وشكري', 'نزار قباني وأدونيس', 'الجاحظ وابن المقفع'], correct: 1, explanation: 'مدرسة الديوان: العقاد، المازني، عبد الرحمن شكري' },
  { id: 'q-s3-arabic-005', gradeKey: 's3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الفرق بين التوكيد اللفظي والمعنوي؟', options: ['لا فرق', 'اللفظي: تكرار اللفظ، المعنوي: بألفاظ خاصة كـ"نفس"', 'المعنوي أقوى دائماً', 'اللفظي أقدم'], correct: 1, explanation: 'التوكيد اللفظي: تكرار اللفظ. المعنوي: بألفاظ مثل نفس وعين وكل وجميع' },
  { id: 'q-s3-arabic-006', gradeKey: 's3', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما مفهوم "وحدة القصيدة" في النقد الأدبي الحديث؟', options: ['أن تكون القصيدة بيتاً واحداً', 'ترابط أجزاء القصيدة وتكاملها حول موضوع واحد', 'أن تكون القصيدة من بحر واحد', 'أن يكتبها شاعر واحد'], correct: 1, explanation: 'وحدة القصيدة: ترابط أفكارها وصورها وعواطفها حول محور واحد' },
  { id: 'q-s3-arabic-007', gradeKey: 's3', subject: 'arabic', skill: 'الأدب', difficulty: 'medium', question: 'ما أبرز ما يميز أدب المهجر؟', options: ['الالتزام بالتراث', 'الحنين للوطن والتجديد في الأساليب', 'الشعر الحربي', 'الأدب الديني فقط'], correct: 1, explanation: 'أدب المهجر يتميز بالحنين للوطن والتجديد الأسلوبي' },
  { id: 'q-s3-arabic-008', gradeKey: 's3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الفرق بين الحال والتمييز؟', options: ['لا فرق', 'الحال: يبين هيئة صاحبه، التمييز: يرفع الإبهام عن النسبة', 'الحال أقدم', 'التمييز أشمل'], correct: 1, explanation: 'الحال: يبين هيئة صاحبه وقت الحدث. التمييز: يرفع الإبهام عن اسم أو نسبة' },
  { id: 'q-s3-arabic-009', gradeKey: 's3', subject: 'arabic', skill: 'البلاغة', difficulty: 'medium', question: 'ما المقصود بـ"الصورة الشعرية"؟', options: ['صورة فوتوغرافية', 'التعبير الفني الذي يجمع الحواس والخيال', 'وصف المنظر الطبيعي', 'القافية والوزن'], correct: 1, explanation: 'الصورة الشعرية: التعبير الفني الذي يستحضر الحواس والمشاعر والخيال' },
  { id: 'q-s3-arabic-010', gradeKey: 's3', subject: 'arabic', skill: 'الأدب', difficulty: 'hard', question: 'من أبرز رواد الرواية العربية؟', options: ['نجيب محفوظ', 'المتنبي', 'الجاحظ', 'ابن خلدون'], correct: 0, explanation: 'نجيب محفوظ رائد الرواية العربية وأول عربي يحصل على نوبل للآداب' },
  { id: 'q-s3-arabic-011', gradeKey: 's3', subject: 'arabic', skill: 'النحو', difficulty: 'hard', question: 'ما الفرق بين الجملة الحالية والجملة الصفة؟', options: ['لا فرق', 'الحالية: صاحبها معرفة، الصفة: موصوفها نكرة', 'الصفة أشمل', 'الحالية أقدم'], correct: 1, explanation: 'الجملة الحالية: صاحبها معرفة. الجملة الصفة: موصوفها نكرة' },
  { id: 'q-s3-arabic-012', gradeKey: 's3', subject: 'arabic', skill: 'البلاغة', difficulty: 'hard', question: 'ما مفهوم "التناص" في النقد الأدبي الحديث؟', options: ['التكرار في القصيدة', 'تداخل النصوص وتأثير النصوص السابقة في اللاحقة', 'الاقتباس المباشر', 'الترجمة الأدبية'], correct: 1, explanation: 'التناص: تداخل النصوص وتأثير النصوص السابقة في اللاحقة بشكل مقصود أو غير مقصود' },
  { id: 'q-s3-math-001', gradeKey: 's3', subject: 'math', skill: 'التكامل', difficulty: 'hard', question: 'ما تكامل x² dx؟', options: ['2x', 'x³', 'x³/3 + C', '3x²'], correct: 2, explanation: '∫x² dx = x³/3 + C' },
  { id: 'q-s3-math-002', gradeKey: 's3', subject: 'math', skill: 'الأعداد المركبة', difficulty: 'hard', question: 'ما قيمة i² حيث i = √(-1)؟', options: ['1', '-1', 'i', '-i'], correct: 1, explanation: 'i² = -1 بتعريف الوحدة التخيلية' },
  { id: 'q-s3-math-003', gradeKey: 's3', subject: 'math', skill: 'التكامل', difficulty: 'hard', question: 'ما تكامل cos(x) dx؟', options: ['-sin(x)+C', 'sin(x)+C', '-cos(x)+C', 'tan(x)+C'], correct: 1, explanation: '∫cos(x) dx = sin(x) + C' },
  { id: 'q-s3-math-004', gradeKey: 's3', subject: 'math', skill: 'الأعداد المركبة', difficulty: 'hard', question: 'ما المرافق المركب للعدد (3+4i)؟', options: ['3-4i', '-3+4i', '-3-4i', '4+3i'], correct: 0, explanation: 'المرافق المركب = تغيير إشارة الجزء التخيلي: 3-4i' },
  { id: 'q-s3-math-005', gradeKey: 's3', subject: 'math', skill: 'التكامل', difficulty: 'hard', question: 'ما قيمة ∫₀¹ x dx؟', options: ['0', '1/4', '1/2', '1'], correct: 2, explanation: '∫₀¹ x dx = [x²/2]₀¹ = 1/2 - 0 = 1/2' },
  { id: 'q-s3-math-006', gradeKey: 's3', subject: 'math', skill: 'الدوال', difficulty: 'hard', question: 'ما مشتقة الدالة المركبة f(g(x))؟', options: ['f(x) × g(x)', 'f(g(x)) × g(x)', 'f(g(x)) + g(x)', 'f(g(x))'], correct: 1, explanation: 'قاعدة السلسلة: مشتقة f(g(x)) = مشتقة f عند g(x) مضروبة في مشتقة g' },
  { id: 'q-s3-math-007', gradeKey: 's3', subject: 'math', skill: 'الأعداد المركبة', difficulty: 'hard', question: 'ما قيمة |3+4i|؟', options: ['3', '4', '5', '7'], correct: 2, explanation: '|3+4i| = √(3²+4²) = √(9+16) = √25 = 5' },
  { id: 'q-s3-math-008', gradeKey: 's3', subject: 'math', skill: 'التكامل', difficulty: 'hard', question: 'ما تكامل e^x dx؟', options: ['x·e^x+C', 'e^x+C', 'e^(x+1)+C', 'ln(x)+C'], correct: 1, explanation: '∫e^x dx = e^x + C' },
  { id: 'q-s3-math-009', gradeKey: 's3', subject: 'math', skill: 'الدوال', difficulty: 'hard', question: 'ما نقطة الالتواء للدالة f(x) = x³؟', options: ['(0,0)', '(1,1)', '(-1,-1)', 'لا توجد'], correct: 0, explanation: 'نقطة الالتواء عند المشتقة الثانية = 0: 6x = 0 → x = 0، النقطة (0,0)' },
  { id: 'q-s3-math-010', gradeKey: 's3', subject: 'math', skill: 'الأعداد المركبة', difficulty: 'medium', question: 'ما ناتج (2+3i) + (1-i)؟', options: ['3+2i', '3-2i', '1+4i', '3+4i'], correct: 0, explanation: '(2+1) + (3-1)i = 3+2i' },
  { id: 'q-s3-math-011', gradeKey: 's3', subject: 'math', skill: 'التكامل', difficulty: 'hard', question: 'ما تكامل 1/x dx؟', options: ['x²/2+C', 'ln|x|+C', '-1/x²+C', 'e^x+C'], correct: 1, explanation: '∫(1/x) dx = ln|x| + C' },
  { id: 'q-s3-math-012', gradeKey: 's3', subject: 'math', skill: 'الدوال', difficulty: 'hard', question: 'ما مشتقة f(x) = x·sin(x)؟', options: ['cos(x)', 'sin(x)+x·cos(x)', 'x·cos(x)', 'sin(x)-x·cos(x)'], correct: 1, explanation: 'قاعدة الضرب: مشتقة(u×v) = مشتقةu × v + u × مشتقةv = sin(x) + x×cos(x)' },
];
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
