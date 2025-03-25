import { TDocumentDefinitions } from "pdfmake/interfaces";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { headerSection } from "./sections/header.section";
import { footerSection } from "./sections/footer.section";
import { ExpenseDocument } from "src/expenses/schemas/expense.schema";

interface ReportOptions {
  title?: string;
  subTitle?: string;
  data?: ExpenseDocument[]
}

export const getExpenseReport = (options: ReportOptions): TDocumentDefinitions => {
  const { title, subTitle, data } = options;
  const totalAmount = data.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    pageOrientation: 'portrait',
    pageSize: 'A4',
    header: headerSection({
      title: title ?? 'Granja Avícola "Puita"',
      subTitle: subTitle ?? 'subtitulo',
    }),
    footer: footerSection,
    pageMargins: [40, 110, 40, 60],
    content: [
      {
        layout: 'lightHorizontalLines',
        marginTop: 30,
        table: {
          headerRows: 1,
          widths: [100, '*', 100],
          body: [
            [{ text: 'Fecha de Registro', bold: true }, { text: 'Descripción', bold: true }, { text: 'Monto', bold: true }],
            ...data.map(expense => [
              { text: format(new Date(expense.date), "dd MMM yyyy", { locale: es }) },
              expense.description,
              { text: `Bs. ${new Intl.NumberFormat('es-Es').format(expense.amount)}` }
            ]),
            [
              { text: 'Total', bold: true, colSpan: 2, alignment: 'right' },
              {},
              { text: `Bs. ${new Intl.NumberFormat('es-ES').format(totalAmount)}`, bold: true }
            ]
          ]
        }
      }
    ]
  }
}