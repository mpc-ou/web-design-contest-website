import { useState } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

/**
 * Component hiển thị token với tùy chọn hiển thị/ẩn và sao chép
 * 
 * @param {Object} props - Properties
 * @param {string} props.token - Token cần hiển thị
 * @param {boolean} props.initialVisibility - Trạng thái hiển thị ban đầu (mặc định: false)
 * @param {function} props.onCopy - Callback khi sao chép (tùy chọn)
 */
const TokenDisplay = ({ 
  token, 
  initialVisibility = false,
  onCopy,
  sx = {}
}) => {
  const [showToken, setShowToken] = useState(initialVisibility);
  const { copyToClipboard, copied } = useCopyToClipboard();

  const handleCopy = () => {
    if (!token) return;
    
    copyToClipboard(token);
    if (onCopy) onCopy(token);
  };

  return (
    <Box position="relative" mb={2} sx={{ width: '100%', ...sx }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: 'background.default',
          maxHeight: 100,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          wordBreak: 'break-all',
          pr: 5 
        }}
      >
        {showToken ? token : '••••••••••••••••••••••••••••••••'}
      </Paper>
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
        <Tooltip title={showToken ? "Hide token" : "Show token"}>
          <IconButton
            size="small"
            onClick={() => setShowToken(!showToken)}
            sx={{ mr: 1 }}
          >
            {showToken ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <IconButton
            size="small"
            onClick={handleCopy}
          >
            {copied ? <CheckCircleIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TokenDisplay;