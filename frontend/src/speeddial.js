import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { styled } from '@mui/material/styles';
import ConsolidateAndSummary from './consolidate_summary';

const CustomSpeedDialIcon = styled(SpeedDialIcon)(({ theme }) => ({
  backgroundColor: '#32348c',
  color: '#fff',
  borderRadius: '50%',
  padding: '17px',
}));

const Dial = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleAddReportClick = () => {
    navigate('/form');
  };

  const handleConsolidateAndSummary = () => {
    navigate('/cs');
  };

  return (
    <>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'fixed', bottom: 16, right: 25 }}
        icon={<CustomSpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AddCircleRoundedIcon sx={{ color: '#32348c' }} />}
          tooltipTitle="Add Report"
          onClick={handleAddReportClick}
        />
        <SpeedDialAction
          icon={<SummarizeIcon sx={{ color: '#32348c' }} />}
          tooltipTitle="Consolidate and Summary"
          onClick={handleConsolidateAndSummary}
        />
      </SpeedDial>
    </>
  );
};

export default Dial;
