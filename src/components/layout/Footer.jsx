import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Web Design Contest</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Cuộc thi thiết kế web hàng năm dành cho sinh viên, nơi bạn có thể
              thể hiện tài năng và sáng tạo trong lĩnh vực thiết kế web.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Liên kết</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/contests"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cuộc thi
                </Link>
              </li>
              <li>
                <Link
                  to="/exhibitions"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Triển lãm
                </Link>
              </li>
              <li>
                <Link
                  to="/sponsors"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Nhà tài trợ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Hỗ trợ</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:it.mpclub.edu.vn"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Liên hệ</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="https://ou.edu.vn/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Trường Đại học Mở TP.HCM
                </Link>
              </li>
              <li>
                <Link
                  to="http://it.ou.edu.vn/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Khoa Công nghệ Thông tin
                </Link>
              </li>
              <li>
                <Link
                  to="https://oumpc.github.io/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  CLB Lập trình trên thiết bị di dộng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} Web Design Contest. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
