import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import FacebookIcon from "../components/icons/FacebookIcon";
import { apiService } from "../services/api";
import { toast } from "sonner";
import MarkdownRenderer from "../components/common/MarkdownRenderer";
import ImageGallery from "../components/common/ImageGallery";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const ContestDetailPage = () => {
  const { contestCode } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await apiService.getContest(contestCode);
        setContest(response.data);
      } catch (error) {
        setError("Không thể tải thông tin cuộc thi");
        console.error("Error fetching contest:", error);
        toast.error("Không thể tải thông tin cuộc thi");
      } finally {
        setLoading(false);
      }
    };

    if (contestCode) {
      fetchContest();
    }
  }, [contestCode]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useDocumentMeta({
    title: contest?.name,
    description: contest?.description,
  });

  const registrationOpenStatus = (contest) => {
    if (!contest?.timeline)
      return {
        status: "closed",
        message: "Đã đóng đăng ký",
      };
    const now = new Date();
    const regStart = new Date(contest.timeline.registrationStart);
    const regEnd = new Date(contest.timeline.registrationEnd);
    if (now < regStart) {
      return {
        status: "upcoming",
        message: "Sắp mở đăng ký",
      };
    }
    if (now >= regStart && now <= regEnd) {
      return {
        status: "open",
        message: "Đang mở đăng ký",
      };
    }
    return {
      status: "closed",
      message: "Đã đóng đăng ký",
    };
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Lỗi</h1>
          <p className="text-muted-foreground mt-2">
            {error || "Không tìm thấy cuộc thi"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="aspect-[3/1] rounded-lg overflow-hidden">
          <img
            src={contest.thumbnail}
            alt={contest.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/img/placeholder-contest.jpg";
            }}
          />
          <div className="absolute inset-0 bg-black/50 flex items-end">
            <div className="p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={
                    registrationOpenStatus(contest).status === "open"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {registrationOpenStatus(contest).message}
                </Badge>
                <Badge variant="outline">{contest.code}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{contest.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QuestionMarkCircleIcon className="h-5 w-5" />
                Mô tả cuộc thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MarkdownRenderer
                  content={contest.description}
                  className="text-xl opacity-90"
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Lịch trình cuộc thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mở đăng ký:</span>
                  <span>{formatDate(contest.timeline.registrationStart)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Đóng đăng ký:</span>
                  <span>{formatDate(contest.timeline.registrationEnd)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bắt đầu cuộc thi:</span>
                  <span>{formatDate(contest.timeline.contestStart)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Kết thúc cuộc thi:</span>
                  <span>{formatDate(contest.timeline.contestEnd)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rounds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5" />
                Các vòng thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contest.rounds.map((round, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{round.name}</h3>
                      <Badge
                        variant={
                          round.type === "final" ? "default" : "secondary"
                        }
                      >
                        {round.type === "final" ? "Chung kết" : "Vòng loại"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {formatDate(round.startDate)} -{" "}
                          {formatDate(round.endDate)}
                        </span>
                      </div>
                      {round.description && (
                        <p className="mt-2">{round.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          {contest.images && contest.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh cuộc thi</CardTitle>
                <CardDescription>
                  Khám phá những hình ảnh về cuộc thi
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <ImageGallery
                  images={contest.images}
                  title={`Hình ảnh ${contest.name}`}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Đăng ký tham gia</CardTitle>
              <CardDescription>
                {registrationOpenStatus(contest).message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationOpenStatus(contest).status === "open" ? (
                contest.hadRegistered ? (
                  <Button disabled className="w-full">
                    Đã đăng ký
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to={`/contests/${contest.code}/register`}>
                      Đăng ký ngay
                    </Link>
                  </Button>
                )
              ) : (
                <Button disabled className="w-full">
                  {registrationOpenStatus(contest).message}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contest Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cuộc thi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Thời gian:{" "}
                  {Math.ceil(
                    (new Date(contest.timeline.contestEnd) -
                      new Date(contest.timeline.contestStart)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  ngày
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contest.roundCount} vòng thi</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {contest.divisions.length} bảng thi
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Divisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Bảng thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contest.divisions.map((division, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{division.name}</h3>
                    <p className="text-muted-foreground mb-3">
                      {division.description}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        <span>Tối đa {division.maxMembers} thành viên/đội</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrophyIcon className="h-4 w-4" />
                        <span>Tối đa {division.maxTeams} đội</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle>Chia sẻ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link
                  to={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                >
                  <FacebookIcon className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailPage;
