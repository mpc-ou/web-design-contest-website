import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

import { Alert, AlertDescription } from "../components/ui/alert";
import GoogleIcon from "../components/icons/GoogleIcon";
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta({
    title: "Đăng nhập - Cuộc thi thiết kế web",
    description: "Đăng nhập để tham gia cuộc thi thiết kế web"
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 ">
      {/* Ratio 1:1 */}
      <div className="relative hidden flex-col bg-muted p-10 text-white lg:flex dark:border-r aspect-square" style={{
        backgroundImage: "url('/img/wd-login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "translateY(-10%)",
        maxHeight: "80vh"
      }}>
        <div className="relative z-20 flex items-center text-lg font-medium">
          Web Design Contest
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Nơi thể hiện tài năng thiết kế web của bạn và kết nối với cộng
              đồng sáng tạo."
            </p>
            <footer className="text-sm">Web Design Contest Team</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Đăng nhập để tham gia cuộc thi thiết kế web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                {loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
