using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace MateCalendar
{
    /// <summary>
    /// Calendr 가 쓰는 SF Symbols 를 20×20 칸에 선으로 다시 그린 것
    /// (chevron.backward · circle · chevron.forward · pin · list.bullet · calendar · ellipsis.circle · circle.inset.filled …).
    /// </summary>
    internal static class Icons
    {
        public const string ChevronLeft = "chevron.backward", ChevronRight = "chevron.forward", Reset = "circle",
            Pin = "pin", PinFill = "pin.fill", List = "list.bullet", Calendar = "calendar", More = "ellipsis.circle",
            ReminderOpen = "reminder.open", ReminderDone = "reminder.done", Warning = "exclamationmark.triangle",
            Refresh = "arrow.clockwise";

        public static FrameworkElement Make(string name, double size, Brush brush)
        {
            var canvas = new Canvas { Width = 20, Height = 20 };
            void Stroke(string data, double w, bool fill = false)
            {
                canvas.Children.Add(new Path
                {
                    Data = Geometry.Parse(data),
                    Stroke = brush, StrokeThickness = w,
                    StrokeStartLineCap = PenLineCap.Round, StrokeEndLineCap = PenLineCap.Round, StrokeLineJoin = PenLineJoin.Round,
                    Fill = fill ? brush : null,
                });
            }
            void Dot(double x, double y, double r)
            {
                canvas.Children.Add(new Path { Data = new EllipseGeometry(new Point(x, y), r, r), Fill = brush });
            }
            void Ring(double r, double w)
            {
                canvas.Children.Add(new Path { Data = new EllipseGeometry(new Point(10, 10), r, r), Stroke = brush, StrokeThickness = w });
            }

            switch (name)
            {
                case ChevronLeft: Stroke("M12.2,4.2 L6.6,10 L12.2,15.8", 1.9); break;
                case ChevronRight: Stroke("M7.8,4.2 L13.4,10 L7.8,15.8", 1.9); break;
                case Reset: Ring(4.4, 1.6); break;
                case Pin:
                    Stroke("M6.6,3.2 L13.4,3.2", 1.5);
                    Stroke("M8.1,3.4 L8.1,8.2 L5.6,11.3 L14.4,11.3 L11.9,8.2 L11.9,3.4", 1.5);
                    Stroke("M10,11.6 L10,17.4", 1.5);
                    break;
                case PinFill:
                    Stroke("M6.6,3.2 L13.4,3.2", 1.5);
                    Stroke("M8.1,3.4 L8.1,8.2 L5.6,11.3 L14.4,11.3 L11.9,8.2 L11.9,3.4 Z", 1.5, true);
                    Stroke("M10,11.6 L10,17.4", 1.5);
                    break;
                case List:
                    Dot(4.6, 5.6, 1.15); Dot(4.6, 10, 1.15); Dot(4.6, 14.4, 1.15);
                    Stroke("M8.2,5.6 L16.4,5.6 M8.2,10 L16.4,10 M8.2,14.4 L16.4,14.4", 1.5);
                    break;
                case Calendar:
                    Stroke("M5.6,3.9 L14.4,3.9 A2.6,2.6 0 0 1 17,6.5 L17,14.2 A2.6,2.6 0 0 1 14.4,16.8 L5.6,16.8 A2.6,2.6 0 0 1 3,14.2 L3,6.5 A2.6,2.6 0 0 1 5.6,3.9 Z", 1.4);
                    Stroke("M5.6,3.9 L14.4,3.9 A2.6,2.6 0 0 1 17,6.5 L17,7.7 L3,7.7 L3,6.5 A2.6,2.6 0 0 1 5.6,3.9 Z", 0.1, true);
                    break;
                case More:
                    Ring(7.3, 1.35);
                    Dot(6.6, 10, 1.05); Dot(10, 10, 1.05); Dot(13.4, 10, 1.05);
                    break;
                case ReminderOpen: Ring(7.6, 1.4); break;
                case ReminderDone: Ring(7.6, 1.4); Dot(10, 10, 4.7); break;
                case Warning:
                    Stroke("M10,3.4 L17.2,16.2 L2.8,16.2 Z", 1.4);
                    Stroke("M10,8.2 L10,11.8", 1.6);
                    Dot(10, 14, 0.95);
                    break;
                case Refresh:
                    Stroke("M15.6,10 A5.6,5.6 0 1 1 13.9,6", 1.6);
                    Stroke("M14.4,2.9 L14.2,6.4 L10.7,6.2", 1.6);
                    break;
            }
            return new Viewbox { Width = size, Height = size, Child = canvas, Stretch = Stretch.Uniform };
        }
    }
}
