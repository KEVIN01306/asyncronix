import { Box } from '@mui/material';
import type { FacturaTermicaData } from '../../../interfaces/factura-termica.interface';
import { FacturaHeader } from './FacturaHeader';
import { FacturaItems } from './FacturaItems';
import { FacturaTotals } from './FacturaTotals';
import { FacturaFooter } from './FacturaFooter';

interface Props {
    data: FacturaTermicaData;
    width?: '58mm' | '80mm';
}

export const FacturaTermicaPreview = ({ data, width = '80mm' }: Props) => {
    return (
        <>
            <style>
                {`
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            background: #fff !important;
                        }
                        /* Oculta la UI de la aplicación */
                        body * {
                            visibility: hidden;
                        }
                        /* Muestra solo el ticket */
                        .factura-termica-container, 
                        .factura-termica-container * {
                            visibility: visible;
                        }
                        .factura-termica-container {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                    }
                `}
            </style>
            <Box
                className="factura-termica-container"
                sx={{
                    width: width === '58mm' ? '240px' : '320px',
                    margin: '0 auto',
                    backgroundColor: '#fff',
                    color: '#000',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
                    minHeight: '100%',
                    height: 'fit-content',

                    '@media print': {
                        boxShadow: 'none',
                        borderRadius: 0,
                        overflow: "visible",
                        padding: "0 !important",
                        width: "auto !important"
                    },

                    '& *': {
                        fontFamily: '"Courier New", monospace !important',
                        fontSize: '13px',
                        lineHeight: 1.2,
                        boxSizing: 'border-box',
                        color: '#000 !important',
                    }
                }}
            >
                <FacturaHeader data={data} />
                <FacturaItems data={data} />
                <FacturaTotals data={data} />
                <FacturaFooter data={data} />
            </Box>
        </>
    );
};
