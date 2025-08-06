import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  useEffect(() => {
    fetchContests(1, true);
  }, [filters]);

  const fetchContests = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page,
        perPage: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
      };

      const response = await apiService.getContests(params);
      const data = response.data;

      if (reset) {
        setContests(data.data || []);
      } else {
        setContests((prev) => [...prev, ...(data.data || [])]);
      }

      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.pageCount || 1,
        hasNext: data.pagination?.hasNext || false,
      });
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasNext && !loadingMore) {
      fetchContests(pagination.currentPage + 1, false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isRegistrationOpen = (contest) => {
    if (!contest?.timeline) return false;
    const now = new Date();
    const regStart = new Date(contest.timeline.registrationStart);
    const regEnd = new Date(contest.timeline.registrationEnd);
    return now >= regStart && now <= regEnd;
  };

  const getContestStatus = (contest) => {
    if (!contest?.timeline) return "draft";
    const now = new Date();
    const regStart = new Date(contest.timeline.registrationStart);
    const regEnd = new Date(contest.timeline.registrationEnd);
    const contestStart = new Date(contest.timeline.contestStart);
    const contestEnd = new Date(contest.timeline.contestEnd);

    if (now < regStart) return "upcoming";
    if (now >= regStart && now <= regEnd) return "registration";
    if (now > regEnd && now < contestStart) return "preparing";
    if (now >= contestStart && now <= contestEnd) return "ongoing";
    if (now > contestEnd) return "completed";
    return contest.status || "draft";
  };

  const getStatusBadge = (contest) => {
    const status = getContestStatus(contest);
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Sắp mở đăng ký</Badge>;
      case "registration":
        return <Badge variant="default">Đang mở đăng ký</Badge>;
      case "preparing":
        return <Badge variant="outline">Chuẩn bị thi đấu</Badge>;
      case "ongoing":
        return <Badge variant="default">Đang thi đấu</Badge>;
      case "completed":
        return <Badge variant="outline">Đã kết thúc</Badge>;
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Tất cả cuộc thi</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Khám phá các cuộc thi thiết kế web hấp dẫn. Tham gia để thể hiện tài
          năng và cạnh tranh với những designer tài năng khác.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc thi..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="completed">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contests.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => (
              <Card
                key={contest._id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={contest.thumbnail || "/img/contest-bg.jpg"}
                    alt={contest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(contest)}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {contest.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {contest.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {contest.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {contest.timeline && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          Đăng ký:{" "}
                          {formatDate(contest.timeline.registrationStart)} -{" "}
                          {formatDate(contest.timeline.registrationEnd)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrophyIcon className="h-4 w-4" />
                        <span>
                          Thi đấu: {formatDate(contest.timeline.contestStart)} -{" "}
                          {formatDate(contest.timeline.contestEnd)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    {contest.roundCount && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrophyIcon className="h-4 w-4" />
                        <span>{contest.roundCount} vòng thi</span>
                      </div>
                    )}
                    {contest.divisions?.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        <span>{contest.divisions.length} bảng thi</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isRegistrationOpen(contest) && (
                      <Button asChild className="flex-1">
                        <Link to={`/contests/${contest.code}/register`}>
                          Đăng ký ngay
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="flex-1">
                      <Link to={`/contests/${contest.code}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-w-32"
              >
                {loadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  "Tải thêm"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <TrophyIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Không tìm thấy cuộc thi nào
          </h3>
          <p className="text-muted-foreground">
            {filters.search || filters.status !== "all"
              ? "Thử thay đổi bộ lọc để tìm kiếm cuộc thi khác"
              : "Các cuộc thi sẽ được cập nhật sớm nhất"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;
