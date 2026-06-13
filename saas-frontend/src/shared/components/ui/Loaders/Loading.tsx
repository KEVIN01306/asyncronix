import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const Loading = () => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            width="100%"
        >
            <Box
                sx={(theme) => ({
                    '& .boxes': {
                        '--size': '32px',
                        '--duration': '800ms',
                        height: 'calc(var(--size) * 2)',
                        width: 'calc(var(--size) * 3)',
                        position: 'relative',
                        transformStyle: 'preserve-3d',
                        transformOrigin: '50% 50%',
                        marginTop: 'calc(var(--size) * 1.5 * -1)',
                        transform: 'rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px)',
                    },
                    '& .boxes .box': {
                        width: 'var(--size)',
                        height: 'var(--size)',
                        top: 0,
                        left: 0,
                        position: 'absolute',
                        transformStyle: 'preserve-3d',
                    },
                    '& .boxes .box:nth-of-type(1)': {
                        transform: 'translate(100%, 0)',
                        animation: 'box1 var(--duration) linear infinite',
                    },
                    '& .boxes .box:nth-of-type(2)': {
                        transform: 'translate(0, 100%)',
                        animation: 'box2 var(--duration) linear infinite',
                    },
                    '& .boxes .box:nth-of-type(3)': {
                        transform: 'translate(100%, 100%)',
                        animation: 'box3 var(--duration) linear infinite',
                    },
                    '& .boxes .box:nth-of-type(4)': {
                        transform: 'translate(200%, 0)',
                        animation: 'box4 var(--duration) linear infinite',
                    },
                    '& .boxes .box > div': {
                        '--background': theme.palette.primary.main,
                        '--top': 'auto',
                        '--right': 'auto',
                        '--bottom': 'auto',
                        '--left': 'auto',
                        '--translateZ': 'calc(var(--size) / 2)',
                        '--rotateY': '0deg',
                        '--rotateX': '0deg',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'var(--background)',
                        top: 'var(--top)',
                        right: 'var(--right)',
                        bottom: 'var(--bottom)',
                        left: 'var(--left)',
                        transform: 'rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ))',
                    },
                    '& .boxes .box > div:nth-of-type(1)': {
                        '--top': 0,
                        '--left': 0,
                    },
                    '& .boxes .box > div:nth-of-type(2)': {
                        '--background': alpha(theme.palette.primary.main, 0.8), 
                        '--right': 0,
                        '--rotateY': '90deg',
                    },
                    '& .boxes .box > div:nth-of-type(3)': {
                        '--background': alpha(theme.palette.primary.main, 0.9),
                        '--rotateX': '-90deg',
                    },
                    '& .boxes .box > div:nth-of-type(4)': {
                        // AQUÍ EL CAMBIO: Usamos el primario actual pero con un 15% de opacidad (muy tenue)
                        // Esto hace que herede el color del tema, pero al ser traslúcido se adapta de forma nativa
                        '--background': alpha(theme.palette.primary.main, 0.15),
                        '--top': 0,
                        '--left': 0,
                        '--translateZ': 'calc(var(--size) * 3 * -1)',
                    },
                    '@keyframes box1': {
                        '0%, 50%': { transform: 'translate(100%, 0)' },
                        '100%': { transform: 'translate(200%, 0)' },
                    },
                    '@keyframes box2': {
                        '0%': { transform: 'translate(0, 100%)' },
                        '50%': { transform: 'translate(0, 0)' },
                        '100%': { transform: 'translate(100%, 0)' },
                    },
                    '@keyframes box3': {
                        '0%, 50%': { transform: 'translate(100%, 100%)' },
                        '100%': { transform: 'translate(0, 100%)' },
                    },
                    '@keyframes box4': {
                        '0%': { transform: 'translate(200%, 0)' },
                        '50%': { transform: 'translate(200%, 100%)' },
                        '100%': { transform: 'translate(100%, 100%)' },
                    },
                })}
            >
                <div className="boxes">
                    <div className="box">
                        <div /><div /><div /><div />
                    </div>
                    <div className="box">
                        <div /><div /><div /><div />
                    </div>
                    <div className="box">
                        <div /><div /><div /><div />
                    </div>
                    <div className="box">
                        <div /><div /><div /><div />
                    </div>
                </div>
            </Box>
        </Box>
    );
};

export default Loading;