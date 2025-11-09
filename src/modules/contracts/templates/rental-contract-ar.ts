/**
 * Rental Contract Terms Template - Arabic
 * Based on design screens: Book Unit-for-rent-sign-the-contract.png
 * Contains 7 sections as shown in the design
 */

export interface ContractTermParams {
  startDate: string;
  endDate: string;
  amount: number;
  numberOfChecks: number;
  insuranceAmount: number;
}

export const RENTAL_CONTRACT_TERMS_AR = (
  params: ContractTermParams,
): string[] => {
  return [
    // Section 1: مدة العقد - Contract Duration
    `**مدة العقد**\n\nتبدأ في ${params.startDate}\n\nتنتهي فيه ${params.endDate}`,

    // Section 2: قيمة الايجار - Rental Value
    `**قيمة الايجار**\n\n(${params.amount.toLocaleString('ar-QA')} ريال قطري) شهرياً تُدفع مقدماً`,

    // Section 3: الشيكات الموثلة - Attached Checks
    `**الشيكات الموثلة**\n\nيلتزم المستأجر بتسليم (${params.numberOfChecks}) شيكاً مؤجل تغطي مدة العقد وتستحق تأميني عند التوقيع.`,

    // Section 4: تغيير المجمع السكني - Residential Complex Change
    `**تغيير المجمع السكني**\n\nيحق للمستأجر الانتقال لوحدة مماثلة في مجمع آخر تابع للمؤجر إذا توفرت وحدات شاغرة.`,

    // Section 5: مكافأة الالتزام - Commitment Penalty (Loyalty Bonus)
    `**مكافأة الالتزام**\n\nإذا التزم المستأجر بسداد الايجار في موعده دون تأخير طوال مدة العقد، يحصل على شهر مجاني في نهاية المدة أو عند التجديد.`,

    // Section 6: التوقيع الإلكتروني - Electronic Signature
    `**التوقيع الإلكتروني**\n\nيعد التوقيع الإلكتروني على العقد ملزماً قانونياً للطرفين.`,

    // Section 7: التأمين - Insurance (Security Deposit)
    `**التأمين**\n\nتأمين ضد ${params.insuranceAmount.toLocaleString('ar-QA')} ريال قطري (شهر ايجار)، يُسترد عند نهاية العقد إذا لم تكن هناك أضرار.`,
  ];
};

// Additional rental contract terms (optional/customizable)
export const ADDITIONAL_RENTAL_TERMS_AR = [
  {
    title: 'الصيانة والإصلاحات',
    content:
      'المؤجر مسؤول عن الصيانة الأساسية للعقار. المستأجر مسؤول عن الصيانة اليومية والأضرار الناتجة عن سوء الاستخدام.',
  },
  {
    title: 'استخدام العقار',
    content:
      'يُستخدم العقار للأغراض السكنية فقط ولا يجوز تأجيره من الباطن بدون موافقة كتابية من المالك.',
  },
  {
    title: 'المرافق والخدمات',
    content:
      'المستأجر مسؤول عن دفع فواتير الكهرباء والماء والخدمات الأخرى المرتبطة بالعقار.',
  },
  {
    title: 'إنهاء العقد المبكر',
    content:
      'في حالة إنهاء العقد قبل انتهاء المدة، يلتزم الطرف المخل بإشعار الطرف الآخر قبل 60 يوماً على الأقل.',
  },
  {
    title: 'التجديد',
    content:
      'يحق للمستأجر تجديد العقد بنفس الشروط أو بشروط جديدة يتم الاتفاق عليها قبل انتهاء مدة العقد بـ 30 يوماً.',
  },
  {
    title: 'القوانين المطبقة',
    content:
      'يخضع هذا العقد لقوانين دولة قطر ويتم تفسيره وفقاً لها. أي نزاع ينشأ عن هذا العقد يحل بالتحكيم أو المحاكم المختصة في دولة قطر.',
  },
];

// Contract header template
export const RENTAL_CONTRACT_HEADER_AR = (
  landlordName: string,
  tenantName: string,
  propertyAddress: string,
  contractNumber: string,
) => {
  return `
# عقد إيجار

**رقم العقد:** ${contractNumber}

**تاريخ التحرير:** ${new Date().toLocaleDateString('ar-QA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

---

## أطراف العقد

**الطرف الأول (المؤجر):** ${landlordName}

**الطرف الثاني (المستأجر):** ${tenantName}

---

## العقار المؤجر

**العنوان:** ${propertyAddress}

---

## شروط وأحكام العقد
`;
};
