import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Box,
  Divider,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  alpha,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack,
} from '@mui/icons-material';

type Email = {
  subject: string;
  from: string;
  receivedTime: string;
  textBody: string;
  snippet: string;
};

type ThemeMode = "light" | "dark" | "jetblack";
type Density = "compact" | "normal" | "comfortable";

// Add keyframes for animations
const shootingStarKeyframes = `
@keyframes shootingStars {
  0% {
    transform: translateX(0) translateY(0) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: translateX(1000px) translateY(-1000px) rotate(45deg);
    opacity: 0;
  }
}`;

const mouseMoveKeyframes = `
@keyframes pulseGlow {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.2;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
}`;

// Add global styles for animations
const globalStyles = `
${shootingStarKeyframes}
${mouseMoveKeyframes}

.shooting-star {
  position: fixed;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 
    0 0 0 4px rgba(255,255,255,0.1),
    0 0 0 8px rgba(255,255,255,0.1),
    0 0 20px rgba(255,255,255,1);
  animation: shootingStars 3s linear infinite;
}

.shooting-star::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,1), transparent);
}

.mouse-glow {
  position: fixed;
  pointer-events: none;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle at center,
    rgba(124, 77, 255, 0.15) 0%,
    rgba(124, 77, 255, 0.1) 20%,
    rgba(124, 77, 255, 0) 70%
  );
  transform: translate(-50%, -50%);
  z-index: 1;
  animation: pulseGlow 4s ease-in-out infinite;
  mix-blend-mode: screen;
}

.mouse-glow::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: pulseGlow 4s ease-in-out infinite reverse;
}
`;

// Placeholder component for unused Bento cells
const PlaceholderBentoCell = ({ title, text }: { title: string; text: string }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      bgcolor: "background.default", // Use theme background
    }}
  >
    <Typography variant="h6">{title}</Typography>
    <Typography variant="body2" color="text.secondary">{text}</Typography>
  </Paper>
);

// Move extractNameFromEmail to a utility function outside components
const extractNameFromEmail = (emailStr: string) => {
  const match = emailStr.match(/^([^<]+)/);
  return match ? match[1].trim() : emailStr;
};

// Email Message Component
const EmailMessage = ({ 
  email, 
  expanded, 
  onExpand,
  density,
}: { 
  email: Email;
  expanded: boolean;
  onExpand: () => void;
  density: Density;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(prev => !prev);
  }, []);

  return (
    <Card 
      variant="outlined" 
      sx={{
        cursor: !expanded ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: !expanded ? 'translateY(-2px)' : 'none',
          boxShadow: theme => !expanded ? 
            '0 8px 24px rgba(78, 0, 255, 0.15)' : 
            theme.shadows[1],
        },
      }}
      onClick={onExpand}
    >
      <CardContent sx={{ p: density === 'compact' ? 2 : (density === 'comfortable' ? 4 : 3) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant={density === 'compact' ? 'body2' : 'body1'} fontWeight="medium">
              {extractNameFromEmail(email.from)}
            </Typography>
            {expanded && (
              <IconButton 
                size="small" 
                onClick={toggleDetails}
                sx={{ ml: 1 }}
              >
                {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {new Date(email.receivedTime).toLocaleString()}
            </Typography>
            {expanded && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Reply">
                  <IconButton size="small">
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Forward">
                  <IconButton size="small">
                    <ForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        <Typography 
          variant={density === 'compact' ? 'body2' : 'body1'} 
          fontWeight="medium" 
          gutterBottom
        >
          {email.subject}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {showDetails && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  <strong>From:</strong> {email.from}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Date:</strong> {new Date(email.receivedTime).toLocaleString()}
                </Typography>
              </Box>
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1,
              }}
            >
              {email.textBody}
            </Typography>
          </Box>
        </Collapse>

        {!expanded && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {email.snippet}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Email Detail Component
const EmailDetail = ({ 
  email,
  density,
  onClose,
}: { 
  email: Email | null;
  density: Density;
  onClose: () => void;
}) => {
  if (!email) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary'
      }}>
        <Typography variant="body1">Select an email to view details</Typography>
      </Box>
    );
  }

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ 
        p: density === 'compact' ? 2 : (density === 'comfortable' ? 4 : 3),
        flex: 1,
        overflowY: 'auto',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={onClose} size="small">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reply">
              <IconButton size="small">
                <ReplyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Forward">
              <IconButton size="small">
                <ForwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="h5" gutterBottom>
          {email.subject}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            From: {email.from}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(email.receivedTime).toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography 
          variant="body1" 
          component="div"
          sx={{ 
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          {email.textBody}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Modified EmailListItem Component
const EmailListItem = ({ 
  email, 
  isSelected,
  onClick,
  density,
}: { 
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  density: Density;
}) => {
  return (
    <Card 
      variant="outlined" 
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(0.98)' : 'none',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: density === 'compact' ? 2 : (density === 'comfortable' ? 4 : 3) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant={density === 'compact' ? 'body2' : 'body1'} fontWeight="medium">
            {extractNameFromEmail(email.from)}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {new Date(email.receivedTime).toLocaleString()}
          </Typography>
        </Box>

        <Typography 
          variant={density === 'compact' ? 'body2' : 'body1'} 
          fontWeight="medium" 
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email.subject}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {email.snippet}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Add example email summaries
const generateEmailSummaries = (emails: Email[]): string => {
  if (emails.length === 0) return "No emails to summarize.";
  
  const summary = emails.map((email, index) => {
    const sender = extractNameFromEmail(email.from);
    const date = new Date(email.receivedTime).toLocaleDateString();
    const keyPoints = email.textBody
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3)
      .map(line => `• ${line.trim()}`)
      .join('\n');
    
    return `📧 Email ${index + 1}:
From: ${sender}
Date: ${date}
Subject: ${email.subject}
Key Points:
${keyPoints}
---`;
  }).join('\n\n');

  return `📊 Email Summary Report\n\n${summary}\n\nTotal Emails: ${emails.length}`;
};

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState<"success" | "error">(
    "success",
  );
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // --- Theme and Density State --- 
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState<ThemeMode>(prefersDarkMode ? 'dark' : 'light');
  const [density, setDensity] = useState<Density>("normal");

  // --- Theme Definitions --- 
  const theme = useMemo(() => {
    let paletteOptions = {};
    
    // Space-inspired colors
    const spaceColors = {
      cosmic: {
        light: '#9D8CFF',
        main: '#7B68EE',
        dark: '#4B0082',
      },
      nebula: {
        light: '#FF69B4',
        main: '#8A2BE2',
        dark: '#4B0082',
      },
      star: {
        light: '#FFD700',
        main: '#FFA500',
        dark: '#FF4500',
      }
    };

    // Common styles
    const commonStyles = {
      borderRadius: 16,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    };

    if (themeMode === 'jetblack') {
      paletteOptions = {
        mode: 'dark',
        background: {
          default: '#000000',
          paper: 'rgba(10, 10, 10, 0.8)',
        },
        primary: {
          main: '#7B68EE',
          light: '#9D8CFF',
          dark: '#4B0082',
        },
        secondary: {
          main: '#FF69B4',
          light: '#FF8CC4',
          dark: '#C4447A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
        },
        divider: 'rgba(255, 255, 255, 0.05)',
      };
      commonStyles.boxShadow = '0 8px 32px rgba(78, 0, 255, 0.2), 0 4px 16px rgba(255, 255, 255, 0.05)';
    } else if (themeMode === 'dark') {
      paletteOptions = {
        mode: 'dark',
        background: {
          default: '#070B14',
          paper: 'rgba(13, 17, 31, 0.7)',
        },
        primary: spaceColors.cosmic,
        secondary: spaceColors.nebula,
        text: {
          primary: '#E8EAF6',
          secondary: 'rgba(176, 190, 197, 0.8)',
        },
      };
      commonStyles.boxShadow = '0 8px 32px rgba(78, 0, 255, 0.15), 0 4px 16px rgba(255, 255, 255, 0.05)';
    } else {
      paletteOptions = {
        mode: 'light',
        background: {
          default: '#F0F4F8',
          paper: 'rgba(255, 255, 255, 0.7)',
        },
        primary: {
          main: '#5C6BC0',
          light: '#8E99F3',
          dark: '#26418F',
        },
        secondary: spaceColors.nebula,
        text: {
          primary: '#1A237E',
          secondary: '#4A4A4A',
        },
      };
      commonStyles.boxShadow = '0 8px 32px rgba(78, 0, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)';
    }

    // Density adjustments
    let spacingMultiplier = 2;
    if (density === 'compact') spacingMultiplier = 1;
    if (density === 'comfortable') spacingMultiplier = 3;

    return createTheme({
      palette: paletteOptions,
      spacing: (factor: number) => `${0.5 * factor * spacingMultiplier}rem`,
      shape: {
        borderRadius: 16,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundImage: themeMode === 'jetblack'
                ? 'radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%)'
                : themeMode === 'dark'
                ? 'radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.15) 0%, rgba(78, 0, 255, 0) 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.08) 0%, rgba(124, 77, 255, 0) 100%)',
              backgroundAttachment: 'fixed',
            },
            '@global': globalStyles,
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              ...commonStyles,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: themeMode === 'jetblack'
                  ? '0 12px 40px rgba(78, 0, 255, 0.25), 0 8px 24px rgba(255, 255, 255, 0.07)'
                  : themeMode === 'dark'
                  ? '0 12px 40px rgba(78, 0, 255, 0.2), 0 8px 24px rgba(255, 255, 255, 0.07)'
                  : '0 12px 40px rgba(78, 0, 255, 0.15), 0 8px 24px rgba(0, 0, 0, 0.07)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              ...commonStyles,
              background: themeMode === 'jetblack'
                ? 'linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)'
                : alpha(paletteOptions.background.paper, 0.7),
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 12px 24px rgba(78, 0, 255, 0.2)',
              },
            },
            contained: {
              background: `linear-gradient(135deg, ${spaceColors.cosmic.main}, ${spaceColors.nebula.main})`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${spaceColors.cosmic.light}, ${spaceColors.nebula.light})`,
              },
            },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&.Mui-selected': {
                background: themeMode === 'jetblack'
                  ? 'linear-gradient(135deg, rgba(78, 0, 255, 0.4), rgba(138, 43, 226, 0.4))'
                  : `linear-gradient(135deg, ${alpha(spaceColors.cosmic.main, 0.4)}, ${alpha(spaceColors.nebula.main, 0.4)})`,
                boxShadow: '0 4px 12px rgba(78, 0, 255, 0.2)',
              },
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(78, 0, 255, 0.15)',
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: 'rgba(255, 255, 255, 0.05)',
              '&::before, &::after': {
                borderColor: 'rgba(255, 255, 255, 0.05)',
              },
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
            },
          },
        },
      },
    });
  }, [themeMode, density]);

  // --- Event Handlers for Controls ---
  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ThemeMode | null,
  ) => {
    if (newMode !== null) {
      setThemeMode(newMode);
    }
  };

  const handleDensityChange = (
    event: React.MouseEvent<HTMLElement>,
    newDensity: Density | null,
  ) => {
    if (newDensity !== null) {
      setDensity(newDensity);
    }
  };

  const fetchEmails = async () => {
    setLoadingEmails(true);
    setMessage("");
    setSummary(null); // Clear summary when fetching emails
    try {
      const res = await fetch("/mesages.json");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      const formatted = data.map((email: any) => ({
        subject: email.subject,
        from: email.from,
        receivedTime: new Date(email.receivedTime).toLocaleString(),
        textBody: email.textBody,
        snippet:
          email.textBody.slice(0, 200) +
          (email.textBody.length > 200 ? "..." : ""),
      }));

      setEmails(formatted);
    } catch (err) {
      setMessage("❌ Failed to fetch emails.");
      setMessageSeverity("error");
      console.error("Error fetching local emails:", err);
      setEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  };

  const summarize = async () => {
    setLoadingSummary(true);
    setMessage("⏳ Generating email summaries...");
    setMessageSeverity("success");
    setSummary(null);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiSummary = generateEmailSummaries(emails);
      setSummary(aiSummary);
      setShowSummary(true);
      setMessage("✅ Email summaries generated!");
      setMessageSeverity("success");
    } catch (err) {
      setMessage("❌ Failed to generate summaries.");
      setMessageSeverity("error");
      console.error("Error generating summaries:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Add shooting stars effect
  useEffect(() => {
    const createShootingStar = () => {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.top = `${Math.random() * window.innerHeight}px`;
      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 3000);
    };

    const interval = setInterval(() => {
      createShootingStar();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Add mouse tracking effect
  useEffect(() => {
    const mouseGlow = document.createElement('div');
    mouseGlow.className = 'mouse-glow';
    document.body.appendChild(mouseGlow);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseGlow.style.left = `${clientX}px`;
      mouseGlow.style.top = `${clientY}px`;
    };

    // Throttle the mousemove event for better performance
    let lastMove = 0;
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove >= 16) { // Approximately 60fps
        handleMouseMove(e);
        lastMove = now;
      }
    };

    window.addEventListener('mousemove', throttledMouseMove);

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      mouseGlow.remove();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          position: 'relative',
          minHeight: '100vh',
          color: 'text.primary',
          zIndex: 1,
          overflow: 'hidden',
          background: themeMode === 'jetblack'
            ? 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)'
            : themeMode === 'dark'
            ? 'linear-gradient(135deg, #0A0F1E 0%, #1A1F2B 100%)'
            : 'linear-gradient(135deg, #F0F4F8 0%, #E8EAF6 100%)',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: themeMode === 'jetblack'
              ? 'radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%)'
              : themeMode === 'dark'
              ? 'radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)'
              : 'radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.05) 0%, rgba(124, 77, 255, 0) 100%)',
            pointerEvents: 'none',
            zIndex: -1,
          },
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            pt: 2,
            pb: 6,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Compact Top Bar */}
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Left section - Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="h6" 
                component="h1" 
                sx={{ 
                  fontWeight: 'medium',
                  whiteSpace: 'nowrap',
                }}
              >
                TidyEmail AI
              </Typography>
            </Box>

            {/* Center section - Theme & Density Controls */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={themeMode}
                exclusive
                onChange={(event, newMode) => newMode && setThemeMode(newMode)}
                aria-label="theme mode"
                size="small"
              >
                <ToggleButton value="light" aria-label="light mode">Light</ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">Dark</ToggleButton>
                <ToggleButton value="jetblack" aria-label="jet black mode">Jet Black</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={density}
                exclusive
                onChange={(event, newDensity) => newDensity && setDensity(newDensity)}
                aria-label="density setting"
                size="small"
              >
                <ToggleButton value="compact" aria-label="compact density">Compact</ToggleButton>
                <ToggleButton value="normal" aria-label="normal density">Normal</ToggleButton>
                <ToggleButton value="comfortable" aria-label="comfortable density">Comfortable</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Right section - Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={summarize}
                disabled={loadingSummary || loadingEmails}
                startIcon={loadingSummary ? <CircularProgress size={16} /> : null}
                size="small"
              >
                {loadingSummary ? "Summarizing..." : "Summarize Emails"}
              </Button>

              {message && (
                <Alert 
                  severity={messageSeverity} 
                  sx={{ 
                    py: 0,
                    px: 1,
                    '& .MuiAlert-message': {
                      padding: '4px 0',
                    },
                  }}
                >
                  {message}
                </Alert>
              )}
            </Box>
          </Box>

          {/* Split View Layout */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '400px auto 1fr',
            gap: 2,
            flex: 1,
            minHeight: 0,
          }}>
            {/* Email List */}
            <Box sx={{ 
              overflowY: 'auto',
              pr: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
            }}>
              <Stack spacing={1}>
                {loadingEmails && emails.length === 0 && (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!loadingEmails && emails.length === 0 && (
                  <Alert severity="info">No unread emails found.</Alert>
                )}
                {emails.map((email, index) => (
                  <EmailListItem
                    key={index}
                    email={email}
                    isSelected={selectedEmail === email}
                    onClick={() => {
                      setSelectedEmail(email);
                      setShowSummary(false);
                    }}
                    density={density}
                  />
                ))}
              </Stack>
            </Box>

            {/* Divider */}
            <Divider orientation="vertical" flexItem />

            {/* Email Detail or Summary */}
            <Box sx={{ overflowY: 'auto' }}>
              {showSummary && summary ? (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ 
                    p: density === 'compact' ? 2 : (density === 'comfortable' ? 4 : 3),
                    flex: 1,
                    overflowY: 'auto',
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h5">Email Summary</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setShowSummary(false)}
                      >
                        <ArrowBack fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography 
                      variant="body1" 
                      component="div"
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                      }}
                    >
                      {summary}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <EmailDetail
                  email={selectedEmail}
                  density={density}
                  onClose={() => setSelectedEmail(null)}
                />
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
