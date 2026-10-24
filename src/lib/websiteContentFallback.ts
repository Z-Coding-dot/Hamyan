export type LegalLocale = 'fa' | 'ps' | 'en'

export type TermsSection = {
  title: string
  items: string[]
}

export type WebsiteContent = {
  terms_page_title: string
  terms_page_heading: string
  terms_intro: string
  terms_sections: TermsSection[]
  terms_common_title: string
  terms_common_items: string[]
  policies_page_title: string
  policies_page_heading: string
  policies_page_intro: string
  privacy_policy_title: string
  privacy_policy_intro: string
  privacy_policy_items: string[]
  privacy_user_rights_title: string
  privacy_user_rights_items: string[]
  privacy_contact_note: string
  home_label: string
}

const WEBSITE_CONTENT_FALLBACK: Record<LegalLocale, WebsiteContent> = {
  fa: {
    terms_page_title: 'شرایط',
    terms_page_heading: 'شرایط استفاده از همیان',
    terms_intro: 'پیش‌نوشت: در این متن، سیستم همیان به عنوان «پلتفورم» یاد می‌شود.',
    terms_sections: [
      {
        title: '1. شرایط استفاده برای دارندگان فروشگاه',
        items: [
          'دارندگان فروشگاه باید اطلاعات دقیق و معتبر ارائه کنند و مسئولیت صحت اطلاعات ثبت‌شده با خودشان است.',
          'ثبت نادرست اطلاعات یا سوءاستفاده از سیستم می‌تواند باعث محدودیت یا تعلیق حساب شود.',
          'ثبت درست تراکنش‌ها، درآمد، هزینه‌ها و گزارش‌ها بر عهده کاربر است.',
          'دارندگان فروشگاه باید ارتباط مسئولانه با مشتریان داشته باشند و سفارش‌ها را به‌موقع مدیریت کنند.',
        ],
      },
      {
        title: '2. شرایط استفاده برای خریداران',
        items: [
          'خریداران می‌توانند مطابق قوانین پلتفورم خرید کنند و اطلاعات تماس/پرداخت خود را دقیق ثبت نمایند.',
          'پرداخت‌ها باید از روش‌های امن و تاییدشده انجام شوند.',
          'در صورت مشکل در سفارش یا پرداخت، کاربر باید از مسیرهای پشتیبانی رسمی اقدام کند.',
          'حفظ محرمانگی اطلاعات شخصی خریداران از اولویت‌های اصلی پلتفورم است.',
        ],
      },
      {
        title: '3. شرایط استفاده برای بازاریابان',
        items: [
          'بازاریابان موظف‌اند از روش‌های قانونی و اخلاقی برای معرفی محصولات و خدمات استفاده کنند.',
          'هرگونه تبلیغ گمراه‌کننده یا فعالیت مغایر قوانین می‌تواند باعث محدودیت دسترسی شود.',
          'جزئیات کمیسیون و پرداخت‌ها مطابق سیاست‌های شفاف سیستم محاسبه و نمایش داده می‌شود.',
        ],
      },
    ],
    terms_common_title: 'نکات مشترک برای همه کاربران',
    terms_common_items: [
      'پلتفورم صرفا بستر ارائه خدمات است و مسئولیت معاملات مستقیم میان کاربران بر عهده طرفین است.',
      'همه کاربران با استفاده از سیستم، رعایت قوانین و مقررات را می‌پذیرند.',
      'هرگونه استفاده مخرب، فریبنده یا غیرقانونی از خدمات ممنوع است.',
    ],
    policies_page_title: 'پالیسی‌ها',
    policies_page_heading: 'پالیسی‌های همیان',
    policies_page_intro:
      'همیان محصول شرکت اولنیش است و از پالیسی حریم خصوصی اولنیش پیروی می‌کند. استفاده از خدمات به معنای پذیرش همان پالیسی است. درخواست حذف حساب از https://ulanish.dev/account-deletion?app=ishanch ثبت می‌شود.',
    privacy_policy_title: 'پالیسی حریم خصوصی',
    privacy_policy_intro:
      'همیان متعلق به شرکت اولنیش است و از پالیسی حریم خصوصی اولنیش در https://ulanish.dev/privacy پیروی می‌کند.',
    privacy_policy_items: [
      'پالیسی معتبر حریم خصوصی، پالیسی شرکت اولنیش است: https://ulanish.dev/privacy',
      'ما فقط اطلاعات ضروری مانند نام، شماره تماس و اطلاعات پروفایل را برای ارائه بهتر خدمات جمع‌آوری می‌کنیم.',
      'اسم و تخلص، عکس پروفایل و سایر نشرات عمومی کاربر در بخش اجتماع همیان، برای عموم قابل مشاهده خواهد بود.',
      'اطلاعات کاربران محرمانه است و بدون رضایت کاربر به شخص ثالث فروخته یا منتقل نمی‌شود، مگر در چارچوب قانون.',
      'برای امنیت حساب، داده‌ها با روش‌های فنی مناسب محافظت می‌شوند و تلاش می‌کنیم از دسترسی غیرمجاز جلوگیری شود.',
      'کاربر مسئول نگهداری امن رمز عبور خود است و نباید اطلاعات ورود را با دیگران شریک کند.',
      'ممکن است بخشی از داده‌ها برای بهبود کیفیت خدمات تحلیل شود، بدون افشای هویت شخصی.',
    ],
    privacy_user_rights_title: 'حقوق کاربر در حریم خصوصی',
    privacy_user_rights_items: [
      'کاربر می‌تواند درخواست اصلاح یا بروزرسانی اطلاعات نادرست حساب خود را ثبت کند.',
      'کاربر می‌تواند درباره نحوه استفاده از اطلاعات خود از تیم پشتیبانی توضیح بخواهد.',
      'حساب‌های مالی نزد شرکت اولنیش نگهداری می‌شود و سوابق مالی باقی می‌ماند. درخواست حذف حساب کاربری از https://ulanish.dev/account-deletion?app=ishanch ثبت می‌شود.',
    ],
    privacy_contact_note: 'درخواست حذف حساب را در https://ulanish.dev/account-deletion?app=ishanch بفرستید. سوال حریم خصوصی مطابق پالیسی اولنیش در https://ulanish.dev/privacy است.',
    home_label: 'صفحه اصلی',
  },
  ps: {
    terms_page_title: 'شرایط',
    terms_page_heading: 'د همیان د کارولو شرایط',
    terms_intro: 'یادونه: په دې متن کې د همیان سیستم ته د پلتفورم په نوم اشاره کېږي.',
    terms_sections: [
      {
        title: '1. د پلورنځي لرونکو لپاره شرایط',
        items: [
          'پلورنځي لرونکي باید دقیق او معتبر معلومات ورکړي او د ثبت شویو معلوماتو د صحت مسؤلیت یې پر خپله غاړه دی.',
          'ناسم معلومات یا د سیستم ناوړه استفاده د حساب د محدودېدو یا ځنډېدو سبب کېدای شي.',
          'د معاملو، عوایدو، لګښتونو او راپورونو صحیح ثبتول د کاروونکي مسؤلیت دی.',
          'پلورنځي لرونکي باید له مشتریانو سره مسؤلانه چلند وکړي او فرمایشونه پر وخت مدیریت کړي.',
        ],
      },
      {
        title: '2. د پېرېدونکو لپاره شرایط',
        items: [
          'پېرېدونکي کولی شي د پلتفورم د اصولو مطابق پېرود وکړي او د اړیکې او تادیې معلومات دقیق ثبت کړي.',
          'تادیات باید د خوندي او تایید شویو لارو ترسره شي.',
          'که په فرمایش یا تادیه کې ستونزه وي، کاروونکی باید له رسمي ملاتړ لارو اقدام وکړي.',
          'د پېرېدونکو د شخصي معلوماتو محرمیت د پلتفورم له مهمو لومړیتوبونو څخه دی.',
        ],
      },
      {
        title: '3. د بازارموندونکو لپاره شرایط',
        items: [
          'بازارموندونکي باید د محصولاتو او خدماتو د معرفي لپاره قانوني او اخلاقي لارې وکاروي.',
          'هر ډول ګمراه کوونکې اعلانونه یا د قوانینو خلاف فعالیتونه د لاسرسي د محدودېدو سبب کېدای شي.',
          'د کمیشن او تادیو جزئیات د سیستم د شفافو پالیسیو مطابق محاسبه او ښودل کېږي.',
        ],
      },
    ],
    terms_common_title: 'د ټولو کاروونکو لپاره ګډ ټکي',
    terms_common_items: [
      'پلتفورم یوازې د خدمتونو بستر دی او د کاروونکو ترمنځ د مستقیمو معاملو مسؤلیت د دواړو اړخونو پر غاړه دی.',
      'ټول کاروونکي د سیستم په کارولو سره د قوانینو او مقرراتو مراعات منل کوي.',
      'هر ډول زیانمن، دوکه کوونکی یا ناقانونه کارول منع دي.',
    ],
    policies_page_title: 'پالیسۍ',
    policies_page_heading: 'د همیان پالیسۍ',
    policies_page_intro:
      'همیان د اولنیش شرکت محصول دی او د اولنیش د محرمیت پالیسۍ پیروي کوي. د خدمت کارول د هماغې پالیسۍ منل دي. د حساب د حذف غوښتنه په https://ulanish.dev/account-deletion?app=ishanch کې ثبتېږي.',
    privacy_policy_title: 'د محرمیت پالیسۍ',
    privacy_policy_intro:
      'همیان د اولنیش شرکت پورې اړه لري او د اولنیش د محرمیت پالیسۍ (https://ulanish.dev/privacy) پیروي کوي.',
    privacy_policy_items: [
      'د محرمیت معتبره پالیسي د اولنیش شرکت پالیسي ده: https://ulanish.dev/privacy',
      'موږ یوازې اړین معلومات لکه نوم، د اړیکې شمېره او پروفایل معلومات د ښه خدمت لپاره راټولوو.',
      'نوم، تخلص، د پروفایل انځور او په همیان اجتماع برخه کې نورې عامه خپرونې د ټولو خلکو لپاره ښکاره کېدای شي.',
      'د کاروونکو معلومات محرمانه دي او د کاروونکي له رضایت پرته درېیم لوري ته نه پلورل کېږي او نه انتقالېږي، مګر د قانون په چوکاټ کې.',
      'د حساب د امنیت لپاره معلومات د مناسب تخنیکي تدابیرو له لارې ساتل کېږي او د غیرمجاز لاسرسي د مخنیوي هڅه کېږي.',
      'کاروونکی د خپل پټنوم د خوندي ساتلو مسؤل دی او باید د ننوتلو معلومات له نورو سره شریک نه کړي.',
      'د خدمت د کیفیت د ښه کولو لپاره ځینې معلومات تحلیل کېدای شي، پرته له دې چې شخصي هویت افشا شي.',
    ],
    privacy_user_rights_title: 'د کاروونکي د محرمیت حقوق',
    privacy_user_rights_items: [
      'کاروونکی کولی شي د ناسم حساب معلوماتو د اصلاح یا تازه کولو غوښتنه وکړي.',
      'کاروونکی کولی شي د خپل معلوماتو د کارونې په اړه له ملاتړ ټیم څخه وضاحت وغواړي.',
      'مالي حسابونه د اولنیش شرکت سره ساتل کېږي او مالي سوابق پاتې کېږي. د کاروونکي حساب د حذف غوښتنه په https://ulanish.dev/account-deletion?app=ishanch کې ثبتېږي.',
    ],
    privacy_contact_note: 'د حساب د حذف غوښتنه په https://ulanish.dev/account-deletion?app=ishanch کې واستوئ. د محرمیت پوښتنې د اولنیش پالیسۍ مطابق دي: https://ulanish.dev/privacy',
    home_label: 'اصلي پاڼه',
  },
  en: {
    terms_page_title: 'Terms',
    terms_page_heading: 'Hamyan Terms of Use',
    terms_intro: 'Preface: In this text, the Hamyan system is referred to as the platform.',
    terms_sections: [
      {
        title: '1. Terms for Store Owners',
        items: [
          'Store owners must provide accurate and valid information and are responsible for the correctness of submitted data.',
          'Incorrect data entry or system abuse may result in account restrictions or suspension.',
          'Users are responsible for correctly recording transactions, income, expenses, and reports.',
          'Store owners must communicate responsibly with customers and manage orders on time.',
        ],
      },
      {
        title: '2. Terms for Buyers',
        items: [
          'Buyers may purchase according to platform rules and must provide accurate contact and payment information.',
          'Payments must be made through secure and approved methods.',
          'If there is an issue with an order or payment, users must use official support channels.',
          "Protecting buyer personal information is one of the platform's top priorities.",
        ],
      },
      {
        title: '3. Terms for Marketers',
        items: [
          'Marketers must use legal and ethical methods to promote products and services.',
          'Misleading advertisements or activities against rules may lead to access restrictions.',
          'Commission and payment details are calculated and displayed according to transparent system policies.',
        ],
      },
    ],
    terms_common_title: 'Common Points for All Users',
    terms_common_items: [
      'The platform only provides service infrastructure, and direct transaction responsibility lies with the involved users.',
      'By using the system, all users accept compliance with rules and regulations.',
      'Any harmful, deceptive, or illegal use of services is prohibited.',
    ],
    policies_page_title: 'Policies',
    policies_page_heading: 'Hamyan Policies',
    policies_page_intro:
      'Hamyan is a product of Ulanish and follows the Ulanish privacy policy. Using the service means accepting that policy. Account deletion requests are submitted at https://ulanish.dev/account-deletion?app=ishanch.',
    privacy_policy_title: 'Privacy Policy',
    privacy_policy_intro:
      'Hamyan belongs to Ulanish and follows the Ulanish privacy policy at https://ulanish.dev/privacy.',
    privacy_policy_items: [
      'The applicable privacy policy is the Ulanish policy: https://ulanish.dev/privacy',
      'We only collect essential information such as name, contact number, and profile details to deliver services better.',
      'First name, last name, profile photo, and other public posts in the Hamyan community section are visible to the public.',
      'User information is confidential and is not sold or transferred to third parties without user consent, except where required by law.',
      'For account security, data is protected with suitable technical measures and we work to prevent unauthorized access.',
      'Users are responsible for keeping their password secure and must not share login credentials with others.',
      'Some data may be analyzed to improve service quality without exposing personal identity.',
    ],
    privacy_user_rights_title: 'User Privacy Rights',
    privacy_user_rights_items: [
      'Users can request correction or updates of inaccurate account information.',
      'Users can ask the support team how their information is being used.',
      'Financial accounts are held with Ulanish, so financial records are retained. Account deletion requests are submitted at https://ulanish.dev/account-deletion?app=ishanch.',
    ],
    privacy_contact_note: 'Submit an account deletion request at https://ulanish.dev/account-deletion?app=ishanch. Privacy questions follow the Ulanish policy at https://ulanish.dev/privacy.',
    home_label: 'Home',
  },
}

export function getWebsiteContentFallback(locale: string | undefined | null): WebsiteContent {
  if (locale === 'ps' || locale === 'en' || locale === 'fa') {
    return WEBSITE_CONTENT_FALLBACK[locale]
  }
  return WEBSITE_CONTENT_FALLBACK.fa
}
