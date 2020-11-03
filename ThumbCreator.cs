using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Journal
{
    public class ThumbCreator
    {
        public static void GenerateThumbs(Stream inputStream, Stream outputStream, int w, int h, bool fromOutside)
        {
            using (Image img = Image.FromStream(inputStream))
            {
                using (Bitmap bmp = new Bitmap(w, h, System.Drawing.Imaging.PixelFormat.Format32bppArgb))
                {
                    using (Graphics g = Graphics.FromImage(bmp))
                    {
                        g.Clear(Color.Transparent);

                        float sW;
                        float sH;

                        if (fromOutside)
                        {
                            if (img.Width > img.Height)
                            {
                                float ratio = (float)h / (float)img.Height;
                                sW = img.Width * ratio;
                                sH = h;
                            }
                            else
                            {
                                float ratio = (float)w / (float)img.Width;
                                sW = w;
                                sH = img.Height * ratio;
                            }
                        }
                        else
                        {
                            if (img.Width > img.Height)
                            {
                                float ratio = (float)w / (float)img.Width;
                                sW = w;
                                sH = img.Height * ratio;

                                if (sH > h)
                                {
                                    ratio = h / sH;
                                    sH = h;
                                    sW = sW * ratio;
                                }
                            }
                            else
                            {
                                float ratio = (float)h / (float)img.Height;
                                sW = img.Width * ratio;
                                sH = h;

                                if (sW > w)
                                {
                                    ratio = w / sW;
                                    sH = sH * ratio;
                                    sW = w;
                                }

                            }
                        }



                        RectangleF r = new RectangleF((float)w / 2 - sW / 2, (float)h / 2 - sH / 2, sW, sH);
                        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                        g.DrawImage(img, r, new RectangleF(0, 0, img.Width, img.Height), GraphicsUnit.Pixel);
                    }

                    bmp.Save(outputStream, ImageFormat.Png);
                }

            }

        }
    }
}
