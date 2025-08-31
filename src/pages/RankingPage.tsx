import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

interface SchoolRanking {
  school: string;
  totalXp: number;
}

function RankingPage() {
  const [ranking, setRanking] = useState<SchoolRanking[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get('/api/ranking/schools');
        setRanking(response.data);
      } catch (error) {
        console.error('Failed to fetch school ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        School Ranking
      </Typography>
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