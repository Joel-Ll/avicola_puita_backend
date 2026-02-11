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
          widths: ['*', '*', '*', '*', '*'],
          body: [
            [{ text: 'Tamaño', bold: true, fontSize: 10 }, { text: 'Precio Caja', bold: true, fontSize: 10 }, { text: 'Precio 1/2 Caja', bold: true, fontSize: 10 }, { text: 'Precio 1/4 Caja', bold: true, fontSize: 10 }, { text: 'Precio Maple', bold: true, fontSize: 10 }],
            ...data.saleItems.map((item) => [
              { text: item.detail.split(':')[0], fontSize: 10 },
              { text: `Bs. ${item.idEgg.box_price}`, bold: true, fontSize: 10 },
              { text: `Bs. ${item.idEgg.box_price / 2}`, bold: true, fontSize: 10 },
              { text: `Bs. ${item.idEgg.box_price / 4}`, bold: true, fontSize: 10 },
              { text: `Bs. ${item.idEgg.unit_price}`, bold: true, fontSize: 10 },
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
          widths: [90, 80, 80, 80, 170],
          body: [
            [
              { text: 'Llevó', bold: true, fontSize: 11 },
              { text: 'Regresó', bold: true, fontSize: 11 },
              { text: 'Vendido', bold: true, fontSize: 11 },
              { text: 'Total (Bs.)', bold: true, fontSize: 11 },
              { text: 'Observaciones', bold: true, fontSize: 11 }
            ],
            // Filas para cada producto
            ...data.saleItems.map((item) => [
              { text: item.detail, fontSize: 10 },
              { text: '', fontSize: 10, color: '#666' },
              { text: '', fontSize: 10, color: '#666' },
              { text: 'Bs. _____', fontSize: 10, color: '#666' },
              { text: '', fontSize: 10 }
            ]),
            // Fila para el SUBTOTAL (destacada)
            [
              { text: 'SUBTOTAL:', bold: true, fontSize: 10, colSpan: 3, alignment: 'right' },
              {}, // Celda vacía por el colSpan
              {}, // Celda vacía por el colSpan
              {
                text: 'Bs. _____',
                bold: true,
                fontSize: 10,
                alignment: 'left',
                fillColor: '#f0f0f0',
                border: [true, true, true, true],
                borderColor: '#333',
                borderWidth: 1
              },
              { text: '', fontSize: 10 }
            ]
          ]
        }
        // table: {
        //   headerRows: 1,
        //   widths: [80, 80, 80, 80, 180],
        //   body: [
        //     [{ text: 'Tamaño', bold: true, fontSize: 11}, { text: 'Cajas', bold: true, fontSize: 11 }, { text: 'Maples', bold: true, fontSize: 11 }, { text: 'Total (Bs.)', bold: true, fontSize: 11 }, { text: 'Observaciones', bold: true, fontSize: 11}],
        //     ...data.saleItems.map((item) => [
        //       { text: item.detail, fontSize: 10 },
        //       { text: '' },
        //       { text: '' },
        //       { text: '' },
        //       { text: '' },
        //     ])
        //   ]
        // }
      },
    ]
  }
}