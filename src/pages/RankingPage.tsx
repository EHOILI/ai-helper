import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface SchoolRanking {
  school: string;
  totalXp: number;
}

function RankingPage() {
  const [ranking, setRanking] = useState<SchoolRanking[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await api.get('/ranking/schools');
        setRanking(response.data);
      } catch (error) {
        console.error('Failed to fetch school ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          School Ranking
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          나가기
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>School</TableCell>
              <TableCell align="right">Total XP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((school, index) => (
              <TableRow key={school.school}>
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell>{school.school}</TableCell>
                <TableCell align="right">{school.totalXp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default RankingPage;