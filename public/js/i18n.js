// ============================================================
//  i18n.js  -  Bilingual translations (English / Arabic)
//  Elements use data-i18n="key" (text) or data-i18n-ph="key"
//  (placeholder). applyLanguage() swaps text + page direction.
// ============================================================

const translations = {
  // ---------- Brand / general ----------
  siteName: { en: 'RoomFlow', ar: 'RoomFlow' },
  tagline: { en: 'Study Room Booking', ar: 'حجز القاعات الدراسية' },
  arabicName: { en: 'نظام حجز القاعات الدراسية', ar: 'نظام حجز القاعات الدراسية' },

  // ---------- Navigation ----------
  nav_home: { en: 'Home', ar: 'الرئيسية' },
  nav_rooms: { en: 'Rooms', ar: 'القاعات' },
  nav_booking: { en: 'Book', ar: 'احجز' },
  nav_calendar: { en: 'Calendar', ar: 'التقويم' },
  nav_mybookings: { en: 'My Bookings', ar: 'حجوزاتي' },
  nav_about: { en: 'About', ar: 'حول' },
  nav_admin: { en: 'Staff Login', ar: 'دخول الموظفين' },
  langSwitch: { en: 'العربية', ar: 'English' },

  // ---------- Home ----------
  hero_title: { en: 'Comfortable, Quiet Study Rooms', ar: 'قاعات دراسية مريحة وهادئة' },
  hero_subtitle: {
    en: 'Bright, fully-equipped rooms with a calm atmosphere and a beautiful city view — the perfect place to study, focus and meet.',
    ar: 'قاعات مضيئة ومجهزة بالكامل بأجواء هادئة وإطلالة جميلة على المدينة — المكان المثالي للدراسة والتركيز والاجتماعات.'
  },
  hero_btn_rooms: { en: 'View Rooms', ar: 'عرض القاعات' },
  hero_btn_book: { en: 'Book Now', ar: 'احجز الآن' },

  // About / brief (نبذة) on the homepage
  home_about_title: { en: 'About Us', ar: 'نبذة عنّا' },
  home_about_text: {
    en: 'RoomFlow offers premium study and meeting rooms designed for comfort and concentration. Our rooms are quiet, well-lit, and equipped with everything you need — from high-speed Wi-Fi and whiteboards to screens and projectors. With flexible hourly pricing and an easy booking experience, we make it simple to find the right space and get to work. That is why students, teams and companies choose RoomFlow.',
    ar: 'يوفّر RoomFlow قاعات دراسة واجتماعات مميّزة مصمّمة للراحة والتركيز. قاعاتنا هادئة وجيدة الإضاءة ومجهّزة بكل ما تحتاجه — من إنترنت سريع وسبورات إلى شاشات وأجهزة عرض. ومع أسعار مرنة بالساعة وتجربة حجز سهلة، نجعل العثور على المكان المناسب وبدء العمل أمراً بسيطاً. لهذا يختار الطلاب والفرق والشركات RoomFlow.'
  },

  features_title: { en: 'Why Choose RoomFlow', ar: 'لماذا تختار RoomFlow' },
  features_subtitle: { en: 'A space built around your comfort', ar: 'مساحة مصمّمة حول راحتك' },
  feature1_title: { en: 'Comfort', ar: 'الراحة' },
  feature1_text: { en: 'Ergonomic chairs, spacious tables and a pleasant, modern setting.', ar: 'كراسي مريحة وطاولات واسعة وأجواء عصرية لطيفة.' },
  feature2_title: { en: 'Quiet & Focus', ar: 'الهدوء والتركيز' },
  feature2_text: { en: 'Calm, private rooms that keep distractions out so you can concentrate.', ar: 'قاعات هادئة وخاصة تُبعد المشتتات لتساعدك على التركيز.' },
  feature3_title: { en: 'Fully Equipped', ar: 'مجهّزة بالكامل' },
  feature3_text: { en: 'Wi-Fi, whiteboards, screens and projectors with a great city view.', ar: 'واي فاي وسبورات وشاشات وأجهزة عرض مع إطلالة رائعة على المدينة.' },

  home_rooms_title: { en: 'Our Rooms', ar: 'قاعاتنا' },
  home_rooms_subtitle: { en: 'Choose the room that fits your needs', ar: 'اختر القاعة التي تناسب احتياجك' },

  // ---------- Rooms ----------
  rooms_title: { en: 'Available Study Rooms', ar: 'القاعات الدراسية المتاحة' },
  rooms_subtitle: { en: 'Browse all rooms and their facilities', ar: 'تصفح جميع القاعات والمرافق المتوفرة' },
  capacity_label: { en: 'Capacity', ar: 'السعة' },
  people_label: { en: 'people', ar: 'أشخاص' },
  per_hour: { en: '/ hour', ar: '/ ساعة' },
  kwd: { en: 'KWD', ar: 'د.ك' },
  available: { en: 'Available', ar: 'متاحة' },
  unavailable: { en: 'Unavailable', ar: 'غير متاحة' },
  book_this_room: { en: 'Book This Room', ar: 'احجز هذه القاعة' },
  loading: { en: 'Loading...', ar: 'جارٍ التحميل...' },

  // ---------- Booking ----------
  booking_title: { en: 'Book a Study Room', ar: 'احجز قاعة دراسية' },
  booking_subtitle: { en: 'Fill in the form to reserve your room', ar: 'املأ النموذج لحجز قاعتك' },
  label_name: { en: 'Full Name', ar: 'الاسم الكامل' },
  label_phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
  label_email: { en: 'Email', ar: 'البريد الإلكتروني' },
  label_room: { en: 'Select Room', ar: 'اختر القاعة' },
  label_date: { en: 'Date', ar: 'التاريخ' },
  label_start: { en: 'Start Time', ar: 'وقت البداية' },
  label_end: { en: 'End Time', ar: 'وقت النهاية' },
  label_people: { en: 'Number of People', ar: 'عدد الأشخاص' },
  label_notes: { en: 'Notes (optional)', ar: 'ملاحظات (اختياري)' },
  choose_room: { en: '-- Choose a room --', ar: '-- اختر قاعة --' },
  submit_booking: { en: 'Submit Booking', ar: 'إرسال الحجز' },

  // Payment (display only - not activated)
  label_payment: { en: 'Payment Method', ar: 'طريقة الدفع' },
  pay_venue: { en: 'Pay at the venue', ar: 'الدفع عند الحضور' },
  pay_knet: { en: 'KNET', ar: 'كي نت' },
  pay_card: { en: 'Credit / Debit Card', ar: 'بطاقة ائتمان / مدى' },
  payment_note: { en: 'Demo only — online payment is not activated yet.', ar: 'للعرض فقط — الدفع الإلكتروني غير مُفعّل حالياً.' },
  suggest_btn: { en: 'Suggest best room', ar: 'اقترح أفضل قاعة' },
  suggest_heading: { en: 'Suggested room', ar: 'القاعة المقترحة' },
  suggest_none: { en: 'No available room matches your request. Try another time or join the waiting list.', ar: 'لا توجد قاعة متاحة تطابق طلبك. جرّب وقتاً آخر أو انضم لقائمة الانتظار.' },
  suggest_fill_first: { en: 'Please fill people, date, start and end time first.', ar: 'يرجى تعبئة عدد الأشخاص والتاريخ ووقت البداية والنهاية أولاً.' },
  use_this_room: { en: 'Use this room', ar: 'استخدم هذه القاعة' },

  // ---------- Booking success / QR ----------
  booking_success_title: { en: 'Booking Confirmed!', ar: 'تم الحجز!' },
  your_qr: { en: 'Your booking QR code', ar: 'رمز QR الخاص بحجزك' },
  qr_hint: { en: 'Show this QR code at the room entrance to verify your booking.', ar: 'أظهر رمز QR هذا عند مدخل القاعة للتحقق من حجزك.' },
  booking_ref: { en: 'Booking reference', ar: 'مرجع الحجز' },
  download_qr: { en: 'Download QR', ar: 'تنزيل QR' },
  new_booking: { en: 'Make another booking', ar: 'حجز آخر' },

  // ---------- Waiting list ----------
  conflict_title: { en: 'Room is busy at that time', ar: 'القاعة محجوزة في هذا الوقت' },
  join_waitlist: { en: 'Join the waiting list', ar: 'انضم لقائمة الانتظار' },
  waitlist_added: { en: 'You are on the waiting list. We will email you if a slot opens.', ar: 'تمت إضافتك لقائمة الانتظار. سنرسل لك بريداً إذا توفر موعد.' },

  // ---------- My Bookings ----------
  mybookings_title: { en: 'My Bookings', ar: 'حجوزاتي' },
  mybookings_subtitle: { en: 'Enter your email to see your booking history', ar: 'أدخل بريدك لعرض سجل حجوزاتك' },
  view_history: { en: 'View History', ar: 'عرض السجل' },
  no_bookings: { en: 'No bookings found for this email.', ar: 'لا توجد حجوزات لهذا البريد.' },

  // ---------- Calendar ----------
  calendar_title: { en: 'Availability Calendar', ar: 'تقويم التوفر' },
  calendar_subtitle: { en: 'See which rooms are booked or available on a date', ar: 'اعرف القاعات المحجوزة أو المتاحة في تاريخ معين' },
  show_btn: { en: 'Show', ar: 'عرض' },
  free: { en: 'Free', ar: 'متاح' },
  busy: { en: 'Booked', ar: 'محجوز' },

  // ---------- About ----------
  about_title: { en: 'About RoomFlow', ar: 'عن RoomFlow' },
  about_text: {
    en: 'RoomFlow helps students and customers reserve study rooms easily inside a café, college or company. Our goal is to make booking simple, fair and reliable, with smart suggestions and QR-based check-in.',
    ar: 'يساعد RoomFlow الطلاب والعملاء على حجز القاعات الدراسية بسهولة داخل المقهى أو الكلية أو الشركة. هدفنا جعل الحجز بسيطاً وعادلاً وموثوقاً، مع اقتراحات ذكية وتحقق عبر رمز QR.'
  },
  contact_title: { en: 'Contact Us', ar: 'تواصل معنا' },
  contact_address: { en: 'Address: Kuwait City, Kuwait', ar: 'العنوان: مدينة الكويت، الكويت' },
  contact_phone: { en: 'Phone: +965 0000 0000', ar: 'الهاتف: 0000 0000 965+' },
  contact_email: { en: 'Email: info@roomflow.com', ar: 'البريد: info@roomflow.com' },
  contact_hours: { en: 'Hours: Daily 8:00 AM - 10:00 PM', ar: 'ساعات العمل: يومياً 8:00 ص - 10:00 م' },

  // ---------- Login ----------
  admin_login_title: { en: 'Staff Login', ar: 'دخول الموظفين' },
  admin_login_subtitle: { en: 'Sign in to access the dashboard', ar: 'سجّل الدخول للوصول إلى لوحة التحكم' },
  label_password: { en: 'Password', ar: 'كلمة المرور' },
  login_btn: { en: 'Login', ar: 'تسجيل الدخول' },
  back_to_site: { en: 'Back to website', ar: 'العودة إلى الموقع' },

  // ---------- Dashboard ----------
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  manage_rooms: { en: 'Rooms', ar: 'القاعات' },
  manage_bookings: { en: 'Bookings', ar: 'الحجوزات' },
  waiting_list: { en: 'Waiting List', ar: 'قائمة الانتظار' },
  manage_accounts: { en: 'Accounts', ar: 'الحسابات' },
  verify_nav: { en: 'Verify QR', ar: 'تحقق QR' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },

  stat_total_rooms: { en: 'Total Rooms', ar: 'إجمالي القاعات' },
  stat_total_bookings: { en: 'Total Bookings', ar: 'إجمالي الحجوزات' },
  stat_confirmed: { en: 'Confirmed', ar: 'مؤكدة' },
  stat_cancelled: { en: 'Cancelled', ar: 'ملغاة' },
  stat_pending: { en: 'Pending', ar: 'قيد الانتظار' },
  stat_waiting: { en: 'Waiting List', ar: 'قائمة الانتظار' },

  chart_most_used: { en: 'Most Used Rooms', ar: 'أكثر القاعات استخداماً' },
  chart_peak: { en: 'Peak Hours', ar: 'أوقات الذروة' },
  chart_monthly: { en: 'Monthly Bookings', ar: 'الحجوزات الشهرية' },
  recent_bookings: { en: 'Recent Bookings', ar: 'أحدث الحجوزات' },

  // ---------- Rooms management ----------
  add_room: { en: '+ Add Room', ar: '+ إضافة قاعة' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  col_name: { en: 'Name', ar: 'الاسم' },
  label_name_en: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  label_name_ar: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  col_size: { en: 'Size', ar: 'الحجم' },
  col_capacity: { en: 'Capacity', ar: 'السعة' },
  col_price: { en: 'Price/hr', ar: 'السعر/ساعة' },
  col_facilities: { en: 'Facilities', ar: 'المرافق' },
  col_status: { en: 'Status', ar: 'الحالة' },
  col_actions: { en: 'Actions', ar: 'الإجراءات' },
  label_description: { en: 'Description', ar: 'الوصف' },
  label_facilities: { en: 'Facilities (comma separated)', ar: 'المرافق (مفصولة بفاصلة)' },
  label_image: { en: 'Image URL (optional)', ar: 'رابط الصورة (اختياري)' },
  label_active: { en: 'Active (visible to public)', ar: 'مفعّلة (مرئية للعامة)' },
  add_room_title: { en: 'Add New Room', ar: 'إضافة قاعة جديدة' },
  edit_room_title: { en: 'Edit Room', ar: 'تعديل القاعة' },
  rooms_admin_title: { en: 'All Rooms', ar: 'جميع القاعات' },

  // ---------- Bookings management ----------
  col_customer: { en: 'Customer', ar: 'العميل' },
  col_contact: { en: 'Contact', ar: 'التواصل' },
  col_room: { en: 'Room', ar: 'القاعة' },
  col_date: { en: 'Date', ar: 'التاريخ' },
  col_time: { en: 'Time', ar: 'الوقت' },
  col_people: { en: 'People', ar: 'الأشخاص' },
  col_checkin: { en: 'Check-in', ar: 'الدخول' },
  bookings_title: { en: 'All Bookings', ar: 'جميع الحجوزات' },
  checked_in: { en: 'Checked in', ar: 'تم الدخول' },
  not_checked: { en: 'Not yet', ar: 'لم يدخل' },

  // ---------- Waiting list management ----------
  waitlist_title: { en: 'Waiting List', ar: 'قائمة الانتظار' },
  col_requested: { en: 'Requested Slot', ar: 'الموعد المطلوب' },
  col_notified: { en: 'Notified', ar: 'تم الإشعار' },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },

  // ---------- Accounts ----------
  accounts_title: { en: 'Staff Accounts', ar: 'حسابات الموظفين' },
  add_account_title: { en: 'Create New Account', ar: 'إنشاء حساب جديد' },
  create_admin_note: { en: 'Only Admins can create or delete accounts. Choose a role: Admin (full access) or Staff (bookings only).', ar: 'يمكن للمديرين فقط إنشاء أو حذف الحسابات. اختر الدور: مدير (صلاحية كاملة) أو موظف (الحجوزات فقط).' },
  label_role: { en: 'Role', ar: 'الدور' },
  role_admin: { en: 'Admin', ar: 'مدير' },
  role_staff: { en: 'Staff', ar: 'موظف' },
  create_btn: { en: 'Create Account', ar: 'إنشاء حساب' },
  col_role: { en: 'Role', ar: 'الدور' },
  col_created: { en: 'Created', ar: 'تاريخ الإنشاء' },

  // ---------- Verify ----------
  verify_title: { en: 'Booking Verification', ar: 'التحقق من الحجز' },
  verify_subtitle: { en: 'Scan a QR code or enter a booking reference', ar: 'امسح رمز QR أو أدخل مرجع الحجز' },
  verify_btn: { en: 'Verify', ar: 'تحقق' },
  verify_valid: { en: 'Valid Booking', ar: 'حجز صالح' },
  verify_invalid: { en: 'Invalid Booking', ar: 'حجز غير صالح' },
  mark_checkin: { en: 'Mark as Checked-in', ar: 'تسجيل الدخول' },
  label_ref: { en: 'Booking reference', ar: 'مرجع الحجز' },

  // ---------- Status ----------
  status_Pending: { en: 'Pending', ar: 'قيد الانتظار' },
  status_Confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  status_Cancelled: { en: 'Cancelled', ar: 'ملغى' },

  // ---------- Misc ----------
  confirm_delete_room: { en: 'Delete this room?', ar: 'حذف هذه القاعة؟' },
  confirm_delete_booking: { en: 'Delete this booking?', ar: 'حذف هذا الحجز؟' },
  confirm_delete_account: { en: 'Delete this account?', ar: 'حذف هذا الحساب؟' },
  confirm_delete_entry: { en: 'Remove this entry?', ar: 'إزالة هذا الإدخال؟' },
  no_data: { en: 'No data found.', ar: 'لا توجد بيانات.' },
  staff_no_access: { en: 'Admins only.', ar: 'للمديرين فقط.' },
  footer_text: { en: '© 2026 RoomFlow. All rights reserved.', ar: '© 2026 RoomFlow. جميع الحقوق محفوظة.' }
};

function getLang() { return localStorage.getItem('lang') || 'en'; }

// Return a room's name in the current language (falls back gracefully)
function roomName(room) {
  if (!room) return '';
  if (getLang() === 'ar') return room.nameAr || room.name || room.nameEn || '';
  return room.nameEn || room.name || room.nameAr || '';
}

function t(key) {
  const lang = getLang();
  return (translations[key] && translations[key][lang]) || key;
}

function applyLanguage() {
  const lang = getLang();
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.textContent = t('langSwitch');
  });
}

function toggleLanguage() {
  localStorage.setItem('lang', getLang() === 'en' ? 'ar' : 'en');
  applyLanguage();
  document.dispatchEvent(new Event('languageChanged'));
}
