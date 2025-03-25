import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Content } from "pdfmake/interfaces";

const logo: Content = {
  image: 'src/public/logo-avicola.png',
  width: 120,
  height: 130,
  alignment: 'center',
  margin: [0, 0, 0, 0]
}

const currentDate: Content = {
  text: format(new Date(), "dd MMM yyyy", { locale: es }),
  alignment: 'right',
  margin: [30, 37],
  width: 180
}

interface HeaderOptions {
  title?: string;
  subTitle?: string;
  showLogo?: boolean;
  showDate?: boolean;
}

export const headerSection = (options: HeaderOptions): Content => {
  const { title, subTitle, showLogo = true, showDate = true } = options;

  const headerLogo: Content = showLogo ? logo : null;
  const headerDate: Content = showDate ? currentDate : null;

  const headerSubTitle: Content = subTitle ? {
    text: subTitle,
    alignment: 'center',
    margin: [44, 2, 0, 0],
    style: {
      fontSize: 16
    }
  } : null;

  const headerTitle: Content = title ? {
    stack: [
      {
        text: title,
        alignment: 'center',
        margin: [44, 30, 0, 0],
        style: {
          bold: true,
          fontSize: 20
        }
      },
      headerSubTitle
    ]
  } : null;

  return {
    columns: [
      headerLogo,
      headerTitle,
      headerDate,
    ]
  }
}