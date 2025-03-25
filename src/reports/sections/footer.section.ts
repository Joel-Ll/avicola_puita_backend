import { Content } from "pdfmake/interfaces";


export const footerSection = (currentPage: number, pageCount: number): Content => {
  return {
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: 'right',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 35, 0]
  }
}