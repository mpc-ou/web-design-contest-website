import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DataTable from '../../../components/admin/ui/DataTable';
import PageHeader from '../../../components/admin/ui/PageHeader';

const MinigameWinnersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [minigame, setMinigame] = useState(null);
  const [winners, setWinners] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMinigame();
    fetchWinners();
  }, [id]);

  const fetchMinigame = async () => {
    try {
      const response = await apiService.getAdminMinigame(id);
      setMinigame(response.data);
    } catch (error) {
      console.error('Error fetching minigame:', error);
      toast.error('Có lỗi khi tải thông tin minigame');
    }
  };

  const fetchWinners = async (params = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getAdminMinigameWinners(id, params);
      setWinners(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setWinners([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await apiService.exportMinigameWinnersReport(id);
      toast.success('Đang tải file Excel...');
    } catch (error) {
      toast.error('Có lỗi khi xuất file Excel');
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/minigames/${id}`),
    },
    {
      label: 'Xuất Excel',
      variant: 'outline',
      icon: Download,
      onClick: handleExport,
    },
  ];

  const columns = [
    {
      key: 'position',
      title: 'Thứ hạng',
      type: 'number',
    },
    {
      key: 'userName',
      title: 'Tên người chơi',
      type: 'text',
    },
    {
      key: 'userEmail',
      title: 'Email',
      type: 'email',
    },
    {
      key: 'prize',
      title: 'Giải thưởng',
      type: 'badge',
    },
    {
      key: 'wonAt',
      title: 'Thời gian thắng',
      type: 'datetime',
    },
    {
      key: 'claimed',
      title: 'Đã nhận',
      type: 'boolean',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Người thắng - ${minigame?.name || 'Minigame'}`}
        description={`Danh sách người thắng minigame #${id}`}
        actions={pageActions}
        badge={{
          text: `${winners.length} người thắng`,
          variant: 'default',
        }}
      />

      <DataTable
        data={winners}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPageChange={(page) => fetchWinners({ page })}
        onSearch={(search) => fetchWinners({ search })}
        searchPlaceholder="Tìm theo tên hoặc email..."
        emptyMessage="Chưa có người thắng nào"
      />
    </div>
  );
};

export default MinigameWinnersPage;