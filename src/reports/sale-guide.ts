import { TDocumentDefinitions } from "pdfmake/interfaces";

import { headerSection } from "./sections/header.section";
import { footerSection } from "./sections/footer.section";
import { TSalePrint } from "src/sales/interface/sale-guide.interface";

interface ReportOptions {
  title?: string;
  subTitle?: string;
  data?: TSalePrint;
  date?: Date
}

export const getSaleGuide = (options: ReportOptions): TDocumentDefinitions => {
  const { title, subTitle, data, date } = options;
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  return {
    pageOrientation: 'portrait',
    pageSize: 'LETTER',
    header: headerSection({
      title: title ?? 'Granja Avícola "Puita"',
      subTitle: subTitle ?? 'subtitulo',
      date
    }),
    footer: footerSection,
    pageMargins: [40, 110, 40, 60],
    content: [
      {
        marginTop: -10,
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Productos enviados', bold: true, fontSize: 10}, { text: 'Precio Maple', bold: true, fontSize: 10 }, { text: 'Precio Caja', bold: true, fontSize: 10}],
            ...data.saleItems.map((item) => [
              { text: item.detail, fontSize: 10},
              { text: `Bs. ${item.idEgg.unit_price}`, bold: true, fontSize: 10},
              { text: `Bs. ${item.idEgg.box_price}`, bold: true, fontSize: 10},
            ])
          ]
        },
        layout: 'noBorders',
      },
      {
        layout: {
          hLineWidth: (i) => {
            return i === 0 ? 0 : 0.5;
          },
          vLineWidth: (i, node) => {
            return i === 0 || i === node.table.widths.length ? 0 : 0.5;
          },
          hLineColor: () => '#aaa',
          vLineColor: () => '#aaa',
          paddingTop: () => 10,
          paddingBottom: () => 10,
          paddingLeft: () => 4,
          paddingRight: () => 4,
        },
        marginTop: 20,
        table: {
          headerRows: 1,
          widths: [80, 80, 80, 80, 180],
          body: [
            [{ text: 'Tamaño', bold: true, fontSize: 11}, { text: 'Cantidad', bold: true, fontSize: 11 }, { text: 'Monto', bold: true, fontSize: 11 }, { text: 'Método', bold: true, fontSize: 11 }, { text: 'Observaciones', bold: true, fontSize: 11}],
            ...rows.map(() => [
              { text: '' },
              { text: '' },
              { text: '' },
              { text: '' },
              { text: '' },
            ])
          ]
        }
      },
    ]
  }
}