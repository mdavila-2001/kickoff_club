import { BrowserRouter } from 'react-router-dom';
import { ShowcasePage } from './pages/ShowcasePage';
import { Layout } from './components/organisms/Layout/Layout';
import { getNavigationForRole } from './components/organisms/Sidebar/navigation';
import { Badge } from './components/atoms/Badge/Badge';

function App() {
  return (
    <BrowserRouter>
      <Layout
        navigationTree={getNavigationForRole('ADMIN')}
        headerSlot={
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Showcase de Componentes
          </span>
        }
        userActionSlot={
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              dmarcelo
            </span>
            <Badge variant="winner">ADMIN</Badge>
          </>
        }
      >
        <ShowcasePage />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
