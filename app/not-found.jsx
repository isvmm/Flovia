export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: '#666' }}>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
