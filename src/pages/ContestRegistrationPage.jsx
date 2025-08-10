/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import ContestTermsModal from '../components/common/ContestTermsModal';

const ContestRegistrationPage = () => {
  const { contestCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [hasOpenedTerms, setHasOpenedTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: currentUser?.email || '',
      phone: '',
      leaderName: '',
      studentId: '',
      facebookLink: '',
      division: '',
      teamName: '',
      members: [{ email: '', studentId: '', fullName: '', facebookLink: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  });

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await apiService.getContest(contestCode);
        setContest(response.data);
        if (response.data?.hadRegistered) {
          toast.info('Bạn đã đăng ký cuộc thi này');
          navigate(`/contests/${contestCode}`);
          return;
        }
      } catch (error) {
        setError('Không thể tải thông tin cuộc thi');
        console.error('Error fetching contest:', error);
        toast.error('Không thể tải thông tin cuộc thi');
      } finally {
        setLoading(false);
      }
    };

    if (contestCode) {
      fetchContest();
    }
  }, [contestCode]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    const contestId = contest?._id || contestCode;

    try {
      if (!agreeTerms) {
        setError('Bạn cần đồng ý điều khoản cuộc thi trước khi gửi.');
        setSubmitting(false);
        return;
      }
      const formData = {
        email: data.email,
        phone: data.phone,
        leaderName: data.leaderName,
        studentId: data.studentId,
        facebookLink: data.facebookLink,
        contestId: contestId,
        division: data.division,
        teamName: data.teamName,
        members: data.members.filter(member => member.fullName && member.email)
      };

      await apiService.submitRegistrationForm(formData);
      setSuccess('Gửi form đăng ký thành công! Vui lòng chờ admin duyệt.');
      toast.success('Đã gửi đăng ký thành công');
      
      // Redirect after success
      setTimeout(() => {
        navigate(`/contests/${contestCode}`);
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
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

  if (!contest) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Không tìm thấy thông tin cuộc thi</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{contest.name}</h1>
          <p className="text-muted-foreground mt-2">Đăng ký tham gia cuộc thi</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Leader Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin trưởng nhóm</CardTitle>
              <CardDescription>
                Nhập thông tin của trưởng nhóm (người đăng ký)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leaderName">Họ và tên *</Label>
                  <Input
                    id="leaderName"
                    {...register('leaderName', { required: 'Họ và tên là bắt buộc' })}
                  />
                  {errors.leaderName && (
                    <p className="text-sm text-destructive mt-1">{errors.leaderName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="studentId">Mã sinh viên *</Label>
                  <Input
                    id="studentId"
                    {...register('studentId', { required: 'Mã sinh viên là bắt buộc' })}
                  />
                  {errors.studentId && (
                    <p className="text-sm text-destructive mt-1">{errors.studentId.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'Email là bắt buộc',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Email không hợp lệ'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="facebookLink">Facebook</Label>
                  <Input
                    id="facebookLink"
                    type="url"
                    placeholder="https://facebook.com/your-profile"
                    {...register('facebookLink')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đội</CardTitle>
              <CardDescription>
                Thông tin chung về đội thi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teamName">Tên đội *</Label>
                <Input
                  id="teamName"
                  {...register('teamName', { required: 'Tên đội là bắt buộc' })}
                />
                {errors.teamName && (
                  <p className="text-sm text-destructive mt-1">{errors.teamName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="division">Bảng thi *</Label>
                <Select onValueChange={(value) => setValue('division', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bảng thi" />
                  </SelectTrigger>
                  <SelectContent>
                    {contest.divisions?.map((division) => (
                      <SelectItem key={division.name} value={division.name}>
                        {division.name} - {division.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.division && (
                  <p className="text-sm text-destructive mt-1">{errors.division.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Thành viên đội</CardTitle>
              <CardDescription>
                Thêm thông tin các thành viên khác trong đội (tối đa 3 thành viên/đội)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Thành viên {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`members.${index}.fullName`}>Họ và tên</Label>
                      <Input
                        {...register(`members.${index}.fullName`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`members.${index}.studentId`}>Mã sinh viên</Label>
                      <Input
                        {...register(`members.${index}.studentId`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`members.${index}.email`}>Email</Label>
                      <Input
                        type="email"
                        {...register(`members.${index}.email`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`members.${index}.facebookLink`}>Facebook</Label>
                      <Input
                        type="url"
                        placeholder="https://facebook.com/profile"
                        {...register(`members.${index}.facebookLink`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {fields.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ email: '', studentId: '', fullName: '', facebookLink: '' })}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Terms & Agreement */}
          <Card>
          <CardHeader>
            <CardTitle>Điều khoản cuộc thi</CardTitle>
            <CardDescription>
              Hãy đọc và đồng ý trước khi gửi đăng ký.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(val) => setAgreeTerms(!!val)}
                disabled={!hasOpenedTerms}
              />
              <Label htmlFor="agreeTerms" className={!hasOpenedTerms ? 'text-muted-foreground' : ''}>
                Tôi đồng ý với <button type="button" className="font-semibold underline" onClick={() => setTermsModalOpen(true)}>điều khoản của cuộc thi</button> đề ra
              </Label>
            </div>
            {!hasOpenedTerms && (
              <p className="text-sm text-muted-foreground">Bấm vào <span className="font-semibold">điều khoản của cuộc thi</span> để xem, sau đó bạn có thể tick đồng ý.</p>
            )}
          </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || !agreeTerms} className="flex-1">
              {submitting ? 'Đang gửi form...' : 'Gửi form đăng ký'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
          </div>
        </form>

        <ContestTermsModal
          open={termsModalOpen}
          onOpenChange={(open) => {
            setTermsModalOpen(open);
            if (!open) setHasOpenedTerms(true);
          }}
        />
      </div>
    </div>
  );
};

export default ContestRegistrationPage;