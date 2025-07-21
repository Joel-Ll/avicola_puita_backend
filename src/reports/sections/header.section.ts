import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Content } from "pdfmake/interfaces";

const logo: Content = {
  image: 'src/public/img-logo.png',
  width: 100,
  height: 100,
  alignment: 'center',
  margin: [0, 0, 0, 0]
}

interface HeaderOptions {
  title?: string;
  subTitle?: string;
  showLogo?: boolean;
  date?: Date;
}

export const headerSection = (options: HeaderOptions): Content => {
  const { title, subTitle, showLogo = true, date } = options;

  const dateRegister: Content = date ? (
    {
      text: format(new Date(date), "dd MMM yyyy", { locale: es }),
      fontSize: 10,
      alignment: 'right',
      margin: [30, 37],
      width: 180
    }
  ) : ({
    text: format(new Date(), "dd MMM yyyy", { locale: es }),
    fontSize: 10,
    alignment: 'right',
    margin: [30, 37],
    width: 180
  })

  const headerLogo: Content = showLogo ? logo : null;
  const headerDate: Content = dateRegister;

  const headerSubTitle: Content = subTitle ? {
    text: subTitle,
    alignment: 'center',
    margin: [44, 2, 0, 0],
    style: {
      fontSize: 10
    }
  } : null;

  const headerTitle: Content = title ? {
    stack: [
      {
        text: title,
        alignment: 'center',
        margin: [48, 30, 0, 0],
        style: {
          bold: true,
          fontSize: 12
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