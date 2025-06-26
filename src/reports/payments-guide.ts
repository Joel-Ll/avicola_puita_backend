import { TDocumentDefinitions } from "pdfmake/interfaces";

import { headerSection } from "./sections/header.section";
import { footerSection } from "./sections/footer.section";
import { TOrderPrint } from "src/customers/interface/delivery-guide.interface";

interface ReportOptions {
  title?: string;
  subTitle?: string;
  data?: TOrderPrint;
  date?: Date
}

export const getPaymentGuide = (options: ReportOptions): TDocumentDefinitions => {
  const { title, subTitle, data, date } = options;

  return {
    pageOrientation: 'landscape',
    pageSize: 'LETTER',
    header: headerSection({
      title: title ?? 'Granja Avícola "Puita"',
      subTitle: subTitle ?? 'subtitulo',
      date
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
          widths: [40, 60, 60, 120, 100, 40, 40, 40, 100],
          body: [
            [{ text: 'Código', bold: true, style: 'tableText' }, { text: 'Cliente', bold: true, style: 'tableText' }, { text: 'Teléfono', bold: true, style: 'tableText' }, { text: 'Dirección', bold: true, style: 'tableText' }, { text: 'Detalle', bold: true, style: 'tableText' }, { text: 'Saldo P.', bold: true, style: 'tableText' }, { text: 'Monto', bold: true, style: 'tableText' }, { text: 'Método', bold: true, style: 'tableText' }, { text: 'Observaciones', bold: true, style: 'tableText' }],
            ...data.map(order => [
              { text: order.orderCode, style: 'tableText', },
              { text: order.customerId.name, style: 'tableText' },
              { text: order.customerId.phone, style: 'tableText' },
              { text: order.customerId.address, style: 'tableText' },
              {
                text: [
                  order.orderItems.map(item => item.detail).join('\n'),
                  '\n',
                  ` Total: Bs. ${order.totalAmount}`
                ],
                style: 'tableText'
              },
              { text: order.balance, style: 'tableText' },
              { text: '' },
              { text: '' },
              { text: '' },
            ]),
          ]
        }
      }
    ]
  }
}