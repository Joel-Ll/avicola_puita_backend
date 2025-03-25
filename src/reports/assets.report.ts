import { TDocumentDefinitions } from "pdfmake/interfaces";
import { headerSection } from "./sections/header.section";
import { footerSection } from "./sections/footer.section";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AssetDocument } from "src/assets/schemas/asset.schema";

interface ReportOptions {
  title?: string;
  subTitle?: string;
  data?: AssetDocument[]
}

export const getAssetReport = (options: ReportOptions): TDocumentDefinitions => {
  const { title, subTitle, data } = options;

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
          widths: ['*', '*', '*'],
          body: [
            ['Ultima actualizacion', 'Nombre', 'Cantidad Unitaria'],
            ...data.map(asset => [
              { text: format(new Date(asset.updatedAt), "dd MMM yyyy", { locale: es }) },
              asset.name,
              asset.quantity
            ]),
          ]
        }
      }
    ]
  }
}