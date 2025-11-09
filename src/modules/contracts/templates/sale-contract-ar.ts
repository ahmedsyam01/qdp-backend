/**
 * Sale Contract Terms Template - Arabic
 * Based on design screens: Book Unit-for-sale-sign-the-contract.png
 * Contains terms similar to rental contract but for property purchase
 */

export interface SaleContractTermParams {
  purchaseDate: string;
  salePrice: number;
  insuranceAmount: number;
}

export const SALE_CONTRACT_TERMS_AR = (
  params: SaleContractTermParams,
): string[] => {
  return [
    // Section 1: تاريخ العقد - Contract Date
    `**تاريخ العقد**\n\nتاريخ الشراء: ${params.purchaseDate}`,

    // Section 2: قيمة الشراء - Purchase Value
    `**قيمة الشراء**\n\n(${params.salePrice.toLocaleString('ar-QA')} ريال قطري) تُدفع دفعة واحدة أو حسب الاتفاق بين الطرفين.`,

    // Section 3: نقل الملكية - Ownership Transfer
    `**نقل الملكية**\n\nيلتزم البائع بنقل ملكية العقار للمشتري فور استلام كامل المبلغ المتفق عليه وإتمام جميع الإجراءات القانونية.`,

    // Section 4: الضمانات - Warranties
    `**الضمانات**\n\nيضمن البائع أن العقار خالٍ من أي رهونات أو ديون أو مطالبات قانونية، وأن له الحق الكامل في بيعه.`,

    // Section 5: التسليم - Handover
    `**التسليم**\n\nيتم تسليم العقار للمشتري في حالة جيدة خالية من العيوب الجوهرية خلال 30 يوماً من تاريخ التوقيع.`,

    // Section 6: التوقيع الإلكتروني - Electronic Signature
    `**التوقيع الإلكتروني**\n\nيعد التوقيع الإلكتروني على العقد ملزماً قانونياً للطرفين.`,

    // Section 7: التأمين - Insurance/Earnest Money
    `**التأمين**\n\nتأمين بمبلغ ${params.insuranceAmount.toLocaleString('ar-QA')} ريال قطري، يُسترد أو يُخصم من المبلغ الإجمالي حسب الاتفاق.`,
  ];
};

// Additional sale contract terms
export const ADDITIONAL_SALE_TERMS_AR = [
  {
    title: 'المستندات المطلوبة',
    content:
      'يلتزم البائع بتقديم جميع المستندات القانونية للعقار بما في ذلك سند الملكية، شهادة عدم الممانعة، والرسومات الهندسية المعتمدة.',
  },
  {
    title: 'الضرائب والرسوم',
    content:
      'يتحمل كل طرف الضرائب والرسوم المترتبة عليه حسب القانون القطري، ما لم يتفق الطرفان على خلاف ذلك.',
  },
  {
    title: 'الإلغاء والغرامات',
    content:
      'في حالة إلغاء العقد من قبل أي من الطرفين، يتم تطبيق الشروط الجزائية المتفق عليها وفقاً للقانون.',
  },
  {
    title: 'الفحص الفني',
    content:
      'يحق للمشتري إجراء فحص فني للعقار قبل إتمام عملية الشراء للتحقق من حالته.',
  },
  {
    title: 'المرافق والخدمات',
    content:
      'يتم نقل جميع حسابات المرافق (كهرباء، ماء، غاز) إلى اسم المشتري فور إتمام عملية البيع.',
  },
  {
    title: 'القوانين المطبقة',
    content:
      'يخضع هذا العقد لقوانين دولة قطر ويتم تفسيره وفقاً لها. أي نزاع ينشأ عن هذا العقد يحل بالتحكيم أو المحاكم المختصة في دولة قطر.',
  },
  {
    title: 'حقوق الارتفاق',
    content:
      'يقر البائع بأن العقار خالٍ من أي حقوق ارتفاق غير مُعلنة أو قيود على الاستخدام.',
  },
  {
    title: 'التأمين على العقار',
    content:
      'يتحمل المشتري مسؤولية التأمين على العقار من تاريخ التسليم الفعلي.',
  },
];

// Contract header template for sale
export const SALE_CONTRACT_HEADER_AR = (
  sellerName: string,
  buyerName: string,
  propertyAddress: string,
  contractNumber: string,
) => {
  return `
# عقد بيع عقار

**رقم العقد:** ${contractNumber}

**تاريخ التحرير:** ${new Date().toLocaleDateString('ar-QA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

---

## أطراف العقد

**الطرف الأول (البائع):** ${sellerName}

**الطرف الثاني (المشتري):** ${buyerName}

---

## العقار المباع

**العنوان:** ${propertyAddress}

---

## شروط وأحكام العقد
`;
};

// Payment terms for sale contracts
export const SALE_PAYMENT_TERMS_AR = [
  {
    type: 'full_payment',
    title: 'الدفع الكامل',
    content: 'يتم دفع كامل المبلغ دفعة واحدة عند توقيع العقد.',
  },
  {
    type: 'installments',
    title: 'الدفع بالتقسيط',
    content:
      'يتم دفع المبلغ على دفعات متفق عليها حسب الجدول الزمني المرفق بالعقد.',
  },
  {
    type: 'mortgage',
    title: 'التمويل البنكي',
    content:
      'يتم الحصول على تمويل بنكي لسداد قيمة العقار، ويتم التنسيق بين البائع والمشتري والبنك.',
  },
];
