import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const tabs = ['Group Stage', 'Playoffs', 'Championship Match'];

function App() {
  const [activeTab, setActiveTab] = useState('Group Stage');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}tournament.json`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load tournament.json');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!data) return <main className="page"><p>Loading tournament...</p></main>;

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Tournament Dashboard</p>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Group Stage' && <GroupStage groups={data.groups} />}
      {activeTab === 'Playoffs' && <PlayoffBracket playoffs={data.playoffs} />}
      {activeTab === 'Championship Match' && <Championship championship={data.championship} />}
    </main>
  );
}

function sortPlayers(players) {
  return [...players].sort((a, b) => b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name));
}

function GroupStage({ groups }) {
  return (
    <section className="group-stage-layout">
      <div className="grid groups-grid">
        {groups.map((group) => {
          const sortedPlayers = sortPlayers(group.players);
          return (
            <article className="card" key={group.name}>
              <div className="card-title-row">
                <h2>{group.name}</h2>
                <span className="qualifier-note">Top 2 qualify</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>W-L</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.name} className={index < 2 ? 'qualifier-row' : ''}>
                      <td><span className="seed">#{index + 1}</span>{player.name}</td>
                      <td>{player.wins}-{player.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          );
        })}
      </div>

      <article className="card match-history-card">
        <div className="card-title-row">
          <h2>Match History</h2>
          <span className="qualifier-note">Edit in tournament.json</span>
        </div>
        <div className="history-grid">
          {groups.map((group) => (
            <div className="history-group" key={`${group.name}-history`}>
              <h3>{group.name}</h3>
              {group.matches?.length ? (
                <div className="history-list">
                  {group.matches.map((match, index) => (
                    <MatchHistoryItem key={`${group.name}-${index}`} match={match} />
                  ))}
                </div>
              ) : (
                <p className="muted">No matches entered yet.</p>
              )}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function MatchHistoryItem({ match }) {
  return (
    <div className="history-item">
      <div>
        <strong>{match.player1}</strong> vs <strong>{match.player2}</strong>
      </div>
      <div className="history-meta">
        <span>{match.score || 'TBD'}</span>
        <span>Winner: {match.winner || 'TBD'}</span>
        {match.replay && <a href={match.replay} target="_blank" rel="noreferrer">Replay</a>}
      </div>
    </div>
  );
}

function PlayoffBracket({ playoffs }) {
  const rounds = playoffs.rounds;
  return (
    <section className="bracket-board">
      {rounds.map((round, roundIndex) => (
        <div className="bracket-column" key={round.name}>
          <h2>{round.name}</h2>
          <div className={`bracket-matches round-${roundIndex + 1}`}>
            {round.matches.map((match) => (
              <BracketMatch key={match.slot} match={match} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function BracketMatch({ match }) {
  return (
    <div className="bracket-match">
      <div className="match-label">{match.slot}</div>
      <PlayerLine name={match.player1} winner={match.winner} score={match.score} />
      <PlayerLine name={match.player2} winner={match.winner} score={match.score} />
      <div className="match-result">{match.score || 'Score TBD'}</div>
    </div>
  );
}

function PlayerLine({ name, winner }) {
  const isWinner = winner && winner === name;
  return <div className={`player-line ${isWinner ? 'winner-line' : ''}`}>{name}</div>;
}

function Championship({ championship }) {
  const hasWinner = championship.winner && championship.winner.trim().length > 0;

  return (
    <section className="championship-wrap">
      <article className="card championship-card">
        <p className="eyebrow">Defending Champion Showdown</p>
        <h2>{championship.title || 'Championship Match'}</h2>
        <div className="final-matchup">
          <span>{championship.player1}</span>
          <strong>vs</strong>
          <span className="defending-champ">{championship.player2}</span>
        </div>
        <p className="score">Score: {championship.score || 'TBD'}</p>
        <p className={hasWinner ? 'winner' : 'muted'}>
          {hasWinner ? `Champion: ${championship.winner}` : 'Champion TBD'}
        </p>
        {championship.replay && (
          <a className="replay" href={championship.replay} target="_blank" rel="noreferrer">Watch Replay</a>
        )}
      </article>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
