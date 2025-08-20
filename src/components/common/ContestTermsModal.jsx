import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ContestTermsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Điều khoản & Điều lệ cuộc thi</DialogTitle>
          <DialogDescription>
            Vui lòng đọc kỹ điều khoản bên dưới. Bạn có thể đóng lại khi xem xong.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] overflow-y-auto space-y-4 pr-2">
          {/* Placeholder content to be provided later by admin */}
          <p>
            Nội dung điều lệ sẽ được bổ sung: giấy phép mã nguồn, yêu cầu public repository trên GitHub,
            yêu cầu deploy, quyền CLB được sử dụng mã nguồn cho mục đích phi lợi nhuận trong tương lai, ...
          </p>
          <p>
            1. Về giấy phép mã nguồn: Bạn đồng ý cấp quyền sử dụng không độc quyền cho BTC/CLB đối với mã nguồn dự án.
          </p>
          <p>
            2. Về GitHub: Yêu cầu đội thi đẩy mã nguồn đầy đủ lên GitHub (public hoặc theo yêu cầu BTC) và cung cấp link.
          </p>
          <p>
            3. Về triển khai: Dự án cần có bản deploy hoạt động để phục vụ quá trình chấm.
          </p>
          <p>
            4. Về sử dụng trong tương lai: CLB có thể tái sử dụng mã nguồn vào các hoạt động phi lợi nhuận, có ghi nhận tác giả.
          </p>
          <p>
            5. Các điều khoản khác: Cam kết không vi phạm bản quyền, bảo mật thông tin, tuân thủ quy định của BTC.
          </p>
          <div className="h-6" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContestTermsModal;

