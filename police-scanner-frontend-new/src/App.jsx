import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

function App() {
  const [lines, setLines] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('Connected to backend, id:', socket.id);
    });

   socket.on('transcript', (data) => {
  setLines((prev) => {
    // find existing utterance
    const idx = prev.findIndex(
      (line) => line.utteranceId === data.utteranceId
    );

    if (idx !== -1) {
      // update existing line (partial -> new partial or -> final)
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data }; // overwrite text, isFinal, ts, etc.
      return copy;
    }

    // first time seeing this utterance, append it
    return [...prev, data];
  });
});


    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Auto-scroll whenever lines change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Police Scanner Transcripts</h1>
      <h1>San Diego Fire Rescue</h1>
      <div
        ref={scrollRef}
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '0.5rem',
        }}
      >
        {lines.map((line) => (
          <div
            key={line.ts + (line.isFinal ? '-final' : '-partial')}
            style={{ opacity: line.isFinal ? 1 : 0.6 }}
          >
            [{new Date(line.ts).toLocaleTimeString()}] {line.text}
            {!line.isFinal && ' (listening...)'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


// import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';


// const SOCKET_URL = 'http://localhost:4000';


// function App() {
//   const [lines, setLines] = useState([]);


//   useEffect(() => {
//     const socket = io(SOCKET_URL, {
//       transports: ['websocket'],
//     });


//     socket.on('connect', () => {
//       console.log('Connected to backend, id:', socket.id);
//     });


//  socket.on('transcript', (data) => {
//   setLines((prev) => {
//     // If the last line is partial, replace it with the new one
//     if (prev.length > 0 && !prev[prev.length - 1].isFinal && !data.isFinal) {
//       const copy = [...prev];
//       copy[copy.length - 1] = data;
//       return copy;
//     }
//     // Otherwise, just append
//     return [...prev, data];
//   });
// });



//     socket.on('disconnect', () => {
//       console.log('Disconnected from backend');
//     });


//     return () => {
//       socket.disconnect();
//     };
//   }, []);


//   return (
//     <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
//       <h1>Police Scanner Transcripts</h1>
//       <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
//         {lines.map((line) => (
//           <div
//             key={line.ts + (line.isFinal ? '-final' : '-partial')}
//             style={{ opacity: line.isFinal ? 1 : 0.6 }}
//           >
//             [{new Date(line.ts).toLocaleTimeString()}] {line.text}
//             {!line.isFinal && ' (listening...)'}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// export default App;

