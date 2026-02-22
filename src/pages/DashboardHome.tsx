import Grid from "@mui/material/Grid";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function DashboardHome() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0f172a", // azul oscuro elegante
        color: "white",
        p: 3,
        borderRadius: 2
      }}
    >
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#1e293b", color: "white" }}>
            <CardContent>
              <Typography color="gray">
                Total Products
              </Typography>
              <Typography variant="h4">
                128
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#1e293b", color: "white" }}>
            <CardContent>
              <Typography color="gray">
                Total Sales
              </Typography>
              <Typography variant="h4">
                $34,500
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#1e293b", color: "white" }}>
            <CardContent>
              <Typography color="gray">
                Active Users
              </Typography>
              <Typography variant="h4">
                892
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}