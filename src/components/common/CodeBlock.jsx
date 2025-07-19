import { Paper } from '@mui/material';

// data - nội dung
// height - chiều cao tối đa của khối code
// sx - các thuộc tính Style 
const CodeBlock = ({ data, height = 200, sx = {} }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      backgroundColor: 'background.default',
      maxHeight: height,
      overflow: 'auto',
      ...sx
    }}
  >
    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  </Paper>
);

export default CodeBlock;