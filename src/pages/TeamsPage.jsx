import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Button } from "../components/ui/button";
import {
  UsersIcon,
  TrophyIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";

import { useDocumentMeta } from "../hooks/useDocumentMeta";

const TeamsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  const [selectedContestData, setSelectedContestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});

  useDocumentMeta({
    title: "Các đội thi - Cuộc thi thiết kế web",
    description: "Xem danh sách các đội thi tham gia cuộc thi"
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedContest, setSelectedContest] = useState(
    searchParams.get("contest") || "all"
  );
  const [selectedDivision, setSelectedDivision] = useState(
    searchParams.get("division") || "all"
  );

  useEffect(() => {
    fetchContests();
  }, []);

  // Reset division when contest changes
  useEffect(() => {
    if (selectedContest === "all") {
      setSelectedContestData(null);
      setSelectedDivision("all");
    } else {
      const contest = contests.find(c => c._id === selectedContest);
      setSelectedContestData(contest);
      
      // Reset division if current division is not available in new contest
      if (contest && contest.divisions) {
        const availableDivisions = contest.divisions.map(d => d.name);
        if (selectedDivision !== "all" && !availableDivisions.includes(selectedDivision)) {
          setSelectedDivision("all");
        }
      }
    }
  }, [selectedContest, contests]);

  const fetchContests = async () => {
    try {
      const response = await apiService.getContests();
      setContests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: searchParams.get("page") || 1,
        limit: 12,
        sortBy: "registeredAt",
        order: "desc",
      };

      // Only add filters if they're not "all"
      const contest = searchParams.get("contest");
      const division = searchParams.get("division");

      if (contest && contest !== "all") {
        params.contestId = contest;
      }
      if (division && division !== "all") {
        params.division = division;
      }

      const response = await apiService.getTeams(params);
      
      let filteredTeams = response.data.data || [];
      
      // Client-side filtering for search term
      const search = searchParams.get("search");
      if (search) {
        filteredTeams = filteredTeams.filter(team =>
          team.teamName.toLowerCase().includes(search.toLowerCase())
        );
      }

      setTeams(filteredTeams);
      setPagination(response.data.pagination || {});
    } catch (error) {
      setError("Không thể tải danh sách đội thi");
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedContest && selectedContest !== "all") params.set("contest", selectedContest);
    if (selectedDivision && selectedDivision !== "all") params.set("division", selectedDivision);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedContest("all");
    setSelectedDivision("all");
    setSelectedContestData(null);
    setSearchParams({});
  };

  const handleContestChange = (value) => {
    setSelectedContest(value);
    // Auto-reset division when contest changes
    setSelectedDivision("all");
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      registered: { label: "Đã đăng ký", variant: "default" },
      confirmed: { label: "Đã xác nhận", variant: "default" },
      disqualified: { label: "Bị loại", variant: "destructive" },
      winner: { label: "Đạt giải", variant: "default" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get available divisions from selected contest
  const getAvailableDivisions = () => {
    if (!selectedContestData || !selectedContestData.divisions) {
      return [];
    }
    return selectedContestData.divisions.filter(division => division.isActive !== false);
  };

  if (loading && teams.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Các đội thi</h1>
        <p className="text-muted-foreground">
          Danh sách các đội tham gia cuộc thi
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <Input
                placeholder="Tìm kiếm tên đội..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Contest Selection */}
            <div>
              <Select value={selectedContest} onValueChange={handleContestChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cuộc thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cuộc thi</SelectItem>
                  {contests.map((contest) => (
                    <SelectItem key={contest._id} value={contest._id}>
                      {contest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Division Selection - Only show when a contest is selected */}
            <div>
              <Select 
                value={selectedDivision} 
                onValueChange={setSelectedDivision}
                disabled={selectedContest === "all"}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      selectedContest === "all" 
                        ? "Chọn cuộc thi trước" 
                        : "Chọn bảng thi"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bảng</SelectItem>
                  {getAvailableDivisions().map((division) => (
                    <SelectItem key={division.name} value={division.name}>
                      {division.name}
                      {division.description && (
                        <span className="text-muted-foreground ml-2">
                          - {division.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contest Info */}
          {selectedContestData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedContestData.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedContestData.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedContestData.divisions?.length || 0} bảng thi
                </Badge>
                <Badge variant="outline">
                  {selectedContestData.rounds?.length || 0} vòng thi
                </Badge>
                {selectedContestData.status && (
                  <Badge variant={selectedContestData.status === 'active' ? 'default' : 'secondary'}>
                    {selectedContestData.status}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="gap-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Results Summary */}
      {teams.length > 0 && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Tìm thấy {pagination.total || teams.length} đội thi
            {selectedContestData && (
              <span> trong cuộc thi "{selectedContestData.name}"</span>
            )}
            {selectedDivision && selectedDivision !== "all" && (
              <span> - bảng "{selectedDivision}"</span>
            )}
          </p>
        </div>
      )}

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card
                key={team._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {team.teamName}
                      </CardTitle>
                      <CardDescription>
                        {team.contest?.name || "Cuộc thi không xác định"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(team.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Bảng:</span>
                      <span>{team.division}</span>
                    </div>

                    {team.table && (
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Bàn:</span>
                        <span>{team.table}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Đăng ký: {formatDate(team.registeredAt)}</span>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Thành viên: </span>
                    <span>
                      {Array.isArray(team.members) ? team.members.length : 0}{" "}
                      người
                    </span>
                  </div>

                  {team.prize && team.prize !== "None" && (
                    <div className="pt-2 border-t">
                      <Badge variant="secondary" className="gap-1">
                        <TrophyIcon className="h-3 w-3" />
                        {team.prize}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Trước
              </Button>

              <span className="text-sm text-muted-foreground">
                Trang {pagination.currentPage} / {pagination.pageCount}
              </span>

              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Không tìm thấy đội thi nào
          </h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;