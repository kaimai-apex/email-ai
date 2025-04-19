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
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";

/**
 * ***************************************************
 * N8N API BASE URL
 * ***************************************************
 * You can override the default (http://localhost:5678) at build‑time with
 * Vite/CRA env vars, e.g.   VITE_N8N_BASE_URL=https://my‑n8n.tld npm run dev
 * ***************************************************
 */
const API_BASE = "http://localhost:5678";

// --------------------------------------------------------------------------------
//  Types
// --------------------------------------------------------------------------------
type Email = {
  subject: string;
  from: string;
  receivedTime: string; // ISO string; converted in UI with toLocaleString()
  textBody: string;
  snippet: string;
};

type ThemeMode = "light" | "dark" | "jetblack";
type Density = "compact" | "normal" | "comfortable";

// --------------------------------------------------------------------------------
//  Fancy global CSS for the star‑field & mouse glow (unchanged)
// --------------------------------------------------------------------------------
const shootingStarKeyframes = `
@keyframes shootingStars {
  0%   { transform: translateX(0) translateY(0) rotate(45deg); opacity: 1; }
  100% { transform: translateX(1000px) translateY(-1000px) rotate(45deg); opacity: 0; }
}`;
const mouseMoveKeyframes = `
@keyframes pulseGlow {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.4; }
  50%  { transform: translate(-50%, -50%) scale(1.5); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.4; }
}`;
const globalStyles = `
${shootingStarKeyframes}
${mouseMoveKeyframes}
.shooting-star{position:fixed;width:2px;height:2px;background:white;border-radius:50%;box-shadow:0 0 0 4px rgba(255,255,255,0.1),0 0 0 8px rgba(255,255,255,0.1),0 0 20px rgba(255,255,255,1);animation:shootingStars 3s linear infinite;}
.shooting-star::before{content:'';position:absolute;top:50%;transform:translateY(-50%);width:50px;height:1px;background:linear-gradient(90deg, rgba(255,255,255,1), transparent);}
.mouse-glow{position:fixed;pointer-events:none;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle at center,rgba(124, 77, 255, 0.15) 0%,rgba(124, 77, 255, 0.1) 20%,rgba(124, 77, 255, 0) 70%);transform:translate(-50%, -50%);z-index:1;animation:pulseGlow 4s ease-in-out infinite;mix-blend-mode:screen;}
.mouse-glow::after{content:'';position:absolute;top:50%;left:50%;width:200px;height:200px;background:radial-gradient(circle at center,rgba(255, 255, 255, 0.1) 0%,rgba(255, 255, 255, 0) 70%);transform:translate(-50%, -50%);border-radius:50%;animation:pulseGlow 4s ease-in-out infinite reverse;}`;

// --------------------------------------------------------------------------------
//  Utility helpers
// --------------------------------------------------------------------------------
const extractNameFromEmail = (emailStr: string) => {
  const match = emailStr.match(/^([^<]+)/);
  return match ? match[1].trim() : emailStr;
};

// (rest of UI‑components remain IDENTICAL – pasted verbatim below)

// --------------------------------------------------------------------------------
//  COMPONENTS (EmailMessage, EmailDetail, EmailListItem, etc.)
// --------------------------------------------------------------------------------
/*  ~~~  UI components copied without changes ...  */

// ------------------------------ EmailMessage -----------------------------------
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
    setShowDetails((prev) => !prev);
  }, []);
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: !expanded ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        "&:hover": {
          transform: !expanded ? "translateY(-2px)" : "none",
          boxShadow: (theme) =>
            !expanded ? "0 8px 24px rgba(78,0,255,0.15)" : theme.shadows[1],
        },
      }}
      onClick={onExpand}
    >
      <CardContent
        sx={{
          p: density === "compact" ? 2 : density === "comfortable" ? 4 : 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant={density === "compact" ? "body2" : "body1"}
              fontWeight="medium"
            >
              {extractNameFromEmail(email.from)}
            </Typography>
            {expanded && (
              <IconButton size="small" onClick={toggleDetails} sx={{ ml: 1 }}>
                {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {new Date(email.receivedTime).toLocaleString()}
            </Typography>
            {expanded && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
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
          variant={density === "compact" ? "body2" : "body1"}
          fontWeight="medium"
          gutterBottom
        >
          {email.subject}
        </Typography>
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {showDetails && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" display="block">
                  <strong>From:</strong> {email.from}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Date:</strong>{" "}
                  {new Date(email.receivedTime).toLocaleString()}
                </Typography>
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                bgcolor: "background.default",
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
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {email.snippet}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ------------------------------ EmailDetail ------------------------------------
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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="body1">Select an email to view details</Typography>
      </Box>
    );
  }
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent
        sx={{
          p: density === "compact" ? 2 : density === "comfortable" ? 4 : 3,
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <IconButton onClick={onClose} size="small">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", gap: 1 }}>
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
          sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
        >
          {email.textBody}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ------------------------------ EmailListItem ----------------------------------
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
}) => (
  <Card
    variant="outlined"
    sx={{
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      transform: isSelected ? "scale(0.98)" : "none",
      bgcolor: isSelected ? "action.selected" : "background.paper",
      "&:hover": { transform: "translateY(-2px)" },
    }}
    onClick={onClick}
  >
    <CardContent
      sx={{ p: density === "compact" ? 2 : density === "comfortable" ? 4 : 3 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          variant={density === "compact" ? "body2" : "body1"}
          fontWeight="medium"
        >
          {extractNameFromEmail(email.from)}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: "nowrap" }}
        >
          {new Date(email.receivedTime).toLocaleString()}
        </Typography>
      </Box>
      <Typography
        variant={density === "compact" ? "body2" : "body1"}
        fontWeight="medium"
        gutterBottom
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {email.subject}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {email.snippet}
      </Typography>
    </CardContent>
  </Card>
);

// ------------------------------ Summary Helper ---------------------------------
const generateEmailSummaries = (emails: Email[]): string => {
  if (!emails.length) return "No emails to summarize.";
  const summary = emails
    .map((email, idx) => {
      const sender = extractNameFromEmail(email.from);
      const date = new Date(email.receivedTime).toLocaleDateString();
      const keyPts = email.textBody
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 3)
        .map((l) => `• ${l.trim()}`)
        .join("\n");
      return `📧 Email ${idx + 1}:\nFrom: ${sender}\nDate: ${date}\nSubject: ${email.subject}\nKey Points:\n${keyPts}\n---`;
    })
    .join("\n\n");
  return `📊 Email Summary Report\n\n${summary}\n\nTotal Emails: ${emails.length}`;
};

// --------------------------------------------------------------------------------
//  MAIN APP COMPONENT
// --------------------------------------------------------------------------------
function App() {
  const theme = useTheme();

  // ----------------- local UI state -----------------
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState<"success" | "error">(
    "success",
  );
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light",
  );
  const [density, setDensity] = useState<Density>("normal");

  // ----------------- FETCH EMAILS (n8n route) -----------------
  const fetchEmails = async () => {
    setLoadingEmails(true);
    setMessage("");
    setSummary(null);
    try {
      const res = await fetch(`${API_BASE}/webhook/get-unread-emails`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const formatted: Email[] = data.map((email: any) => ({
        subject: email.subject,
        from: email.from,
        receivedTime: email.receivedTime,
        textBody: email.textBody,
        snippet:
          email.textBody.slice(0, 200) +
          (email.textBody.length > 200 ? "..." : ""),
      }));
      setEmails(formatted);
    } catch (err) {
      console.error("Error fetching via n8n route:", err);
      setMessage("❌ Failed to fetch emails.");
      setMessageSeverity("error");
      setEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  };

  // ----------------- SUMMARIZE EMAILS (n8n route) -----------------
  const summarize = async () => {
    setLoadingSummary(true);
    setMessage("⏳ Generating email summaries...");
    setMessageSeverity("success");
    setSummary(null);
    try {
      const res = await fetch(`${API_BASE}/webhook/summarize-unread`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const out = json.output ?? null;
      if (!out) throw new Error("No summary returned by n8n");
      setSummary(out);
      setShowSummary(true);
      setMessage("✅ Email summaries generated!");
    } catch (err) {
      console.error(
        "Error summarizing via n8n route, falling back to local summary:",
        err,
      );
      if (emails.length) {
        const local = generateEmailSummaries(emails);
        setSummary(local);
        setShowSummary(true);
        setMessage("⚠️  Remote summarize failed — used local summary instead.");
        setMessageSeverity("error");
      } else {
        setMessage("❌ Failed to generate summaries.");
        setMessageSeverity("error");
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  // ----------------- EFFECTS -----------------
  useEffect(() => {
    fetchEmails();
  }, []);

  // Add shooting stars effect
  useEffect(() => {
    const createShootingStar = () => {
      const star = document.createElement("div");
      star.className = "shooting-star";
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
    const mouseGlow = document.createElement("div");
    mouseGlow.className = "mouse-glow";
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
      if (now - lastMove >= 16) {
        // Approximately 60fps
        handleMouseMove(e);
        lastMove = now;
      }
    };

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      mouseGlow.remove();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          color: "text.primary",
          zIndex: 1,
          overflow: "hidden",
          background:
            themeMode === "jetblack"
              ? "linear-gradient(135deg, #000000 0%, #0A0A0A 100%)"
              : themeMode === "dark"
                ? "linear-gradient(135deg, #0A0F1E 0%, #1A1F2B 100%)"
                : "linear-gradient(135deg, #F0F4F8 0%, #E8EAF6 100%)",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              themeMode === "jetblack"
                ? "radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%)"
                : themeMode === "dark"
                  ? "radial-gradient(circle at 50% 50%, rgba(78, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)"
                  : "radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.05) 0%, rgba(124, 77, 255, 0) 100%)",
            pointerEvents: "none",
            zIndex: -1,
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            pt: 2,
            pb: 6,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Compact Top Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Left section - Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: "medium",
                  whiteSpace: "nowrap",
                }}
              >
                TidyEmail AI
              </Typography>
            </Box>

            {/* Center section - Theme & Density Controls */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <ToggleButtonGroup
                value={themeMode}
                exclusive
                onChange={(event, newMode) => newMode && setThemeMode(newMode)}
                aria-label="theme mode"
                size="small"
              >
                <ToggleButton value="light" aria-label="light mode">
                  Light
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">
                  Dark
                </ToggleButton>
                <ToggleButton value="jetblack" aria-label="jet black mode">
                  Jet Black
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={density}
                exclusive
                onChange={(event, newDensity) =>
                  newDensity && setDensity(newDensity)
                }
                aria-label="density setting"
                size="small"
              >
                <ToggleButton value="compact" aria-label="compact density">
                  Compact
                </ToggleButton>
                <ToggleButton value="normal" aria-label="normal density">
                  Normal
                </ToggleButton>
                <ToggleButton
                  value="comfortable"
                  aria-label="comfortable density"
                >
                  Comfortable
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Right section - Actions */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={summarize}
                disabled={loadingSummary || loadingEmails}
                startIcon={
                  loadingSummary ? <CircularProgress size={16} /> : null
                }
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
                    "& .MuiAlert-message": {
                      padding: "4px 0",
                    },
                  }}
                >
                  {message}
                </Alert>
              )}
            </Box>
          </Box>

          {/* Split View Layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "400px auto 1fr",
              gap: 2,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Email List */}
            <Box
              sx={{
                overflowY: "auto",
                pr: 2,
                borderRight: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1}>
                {loadingEmails && emails.length === 0 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 3 }}
                  >
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
            <Box sx={{ overflowY: "auto" }}>
              {showSummary && summary ? (
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p:
                        density === "compact"
                          ? 2
                          : density === "comfortable"
                            ? 4
                            : 3,
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
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
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
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
