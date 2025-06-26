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
    styles: {
      tableText: {
        fontSize: 10,
        margin: 0
      }
    },
    footer: footerSection,
    pageMargins: [40, 110, 40, 60],
    content: [
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: [100, '*', 70],
          body: [
            [{ text: 'Fecha de Registro', bold: true, style: 'tableText' }, { text: 'Descripción', bold: true, style: 'tableText' }, { text: 'Monto', bold: true, style: 'tableText'}],
            ...data.map(expense => [
              { text: format(new Date(expense.date), "dd MMM yyyy", { locale: es }), style: 'tableText'},
              { text: expense.description, style: 'tableText'},
              { text: `Bs. ${new Intl.NumberFormat('es-Es').format(expense.amount)}`, style: 'tableText' }
            ]),
            [
              { text: 'Total', bold: true, colSpan: 2, alignment: 'right', style: 'tableText'},
              {},
              { text: `Bs. ${new Intl.NumberFormat('es-ES').format(totalAmount)}`, bold: true, style: 'tableText'}
            ]
          ]
        }
      }
    ]
  }
}