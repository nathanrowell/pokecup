import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const tabs = ['Group Stage', 'Playoffs', 'Pick Ems', 'Playoff Pick Ems'];

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
      {activeTab === 'Pick Ems' && <PickEms groups={data.groups} />}
      {activeTab === 'Playoff Pick Ems' && <PlayoffPickEms playoffs={data.playoffs} />}
    </main>
  );
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.diff || 0) - (a.diff || 0);
  });
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
                    <th>Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.name} className={index < 2 ? 'qualifier-row' : ''}>
                      <td><span className="seed">#{index + 1}</span>{player.name}</td>
                      <td>{player.wins}-{player.losses}</td>
                        <td
                          className={
                            player.diff > 0
                              ? 'positive-diff'
                              : player.diff < 0
                              ? 'negative-diff'
                              : ''
                          }
                        >
                          {player.diff > 0 ? `+${player.diff}` : player.diff || 0}
                        </td>
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
        <span>{match.score || 'Score TBD'}</span>

        {match.winner && <span>Winner: {match.winner}</span>}

        {match.replays?.length
          ? match.replays.map((replay, index) => (
              <a key={replay} href={replay} target="_blank" rel="noreferrer">
                Replay {index + 1}
              </a>
            ))
          : match.replay && (
              <a href={match.replay} target="_blank" rel="noreferrer">
                Replay
              </a>
            )}
      </div>
    </div>
  );
}

function PlayoffBracket({ playoffs }) {
  const rounds = playoffs.rounds;

  return (
    <section className="bracket-board double-elim-bracket">
      {rounds.map((round) => (
        <div
          className={`bracket-column bracket-${round.name
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll('/', '')}`}
          key={round.name}
        >
          <h2>{round.name}</h2>
          <div className="bracket-matches">
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
      <PlayerLine name={match.player1} winner={match.winner} />
      <PlayerLine name={match.player2} winner={match.winner} />

      <div className="history-meta">
        <span>{match.score || 'Score TBD'}</span>

        {match.winner && <span>Winner: {match.winner}</span>}

        {match.replays?.length
  ? match.replays.map((replay, index) => (
      <a key={replay} href={replay} target="_blank" rel="noreferrer">
        Replay {index + 1}
      </a>
    ))
  : match.replay && (
      <a href={match.replay} target="_blank" rel="noreferrer">
        Replay
      </a>
    )}
      </div>
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
function PickEms({ groups }) {
  const [picks, setPicks] = useState({});

  function togglePick(groupName, playerName) {
    setPicks((current) => {
      const groupPicks = current[groupName] || [];
      const alreadyPicked = groupPicks.includes(playerName);

      if (alreadyPicked) {
        return {
          ...current,
          [groupName]: groupPicks.filter((name) => name !== playerName)
        };
      }

      if (groupPicks.length >= 2) return current;

      return {
        ...current,
        [groupName]: [...groupPicks, playerName]
      };
    });
  }

  const totalPicks = Object.values(picks).flat().length;
  const finished = totalPicks === groups.length * 2;

  return (
    <section className="pickems-page">
      <article className="card">
        <h2>Pick ’Ems</h2>
        <p className="muted">Pick 2 players from each group to advance.</p>
      </article>

      <div className="grid groups-grid">
        {groups.map((group) => {
          const groupPicks = picks[group.name] || [];

          return (
            <article className="card" key={group.name}>
              <div className="card-title-row">
                <h2>{group.name}</h2>
                <span className="qualifier-note">{groupPicks.length}/2 picked</span>
              </div>

              <div className="pickems-list">
                {group.players.map((player) => {
                  const selected = groupPicks.includes(player.name);

                  return (
                    <button
                      key={player.name}
                      className={`pickems-player ${selected ? 'selected' : ''}`}
                      onClick={() => togglePick(group.name, player.name)}
                    >
                      {player.name}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {finished && (
        <article className="card pickems-report">
          <h2>Your Picks:</h2>

          <div className="report-grid">
            {groups.map((group) => (
              <div className="report-group" key={`${group.name}-report`}>
                <h3>{group.name}</h3>
                <p>{(picks[group.name] || []).join(' ♦ ')}</p>
              </div>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}
function PlayoffPickEms({ playoffs }) {
  const qfMatches = playoffs.rounds[0].matches;

  const [qfPicks, setQfPicks] = useState({});
  const [sfPicks, setSfPicks] = useState({});
  const [champion, setChampion] = useState('');

  function pickQF(slot, player) {
    setQfPicks((current) => {
      const updated = { ...current, [slot]: player };

      setSfPicks((sfCurrent) => {
        const next = { ...sfCurrent };

        if (slot === 'QF1' || slot === 'QF2') {
          delete next.SF1;
        }

        if (slot === 'QF3' || slot === 'QF4') {
          delete next.SF2;
        }

        return next;
      });

      setChampion('');

      return updated;
    });
  }

  function pickSF(slot, player) {
    setSfPicks((current) => {
      const updated = { ...current, [slot]: player };
      setChampion('');
      return updated;
    });
  }

  const sf1Players = [qfPicks.QF1, qfPicks.QF2].filter(Boolean);
  const sf2Players = [qfPicks.QF3, qfPicks.QF4].filter(Boolean);
  const gfPlayers = [sfPicks.SF1, sfPicks.SF2].filter(Boolean);

  const finished = qfPicks.QF1 && qfPicks.QF2 && qfPicks.QF3 && qfPicks.QF4 && sfPicks.SF1 && sfPicks.SF2 && champion;

  return (
    <section className="pickems-page">
      <article className="card">
        <h2>Playoff Pick ’Ems</h2>
        <p className="muted">Pick each matchup winner to build your playoff bracket.</p>
      </article>

      <section className="bracket-board double-elim-bracket playoff-pickems-bracket">
        <div className="bracket-column bracket-quarterfinals">
          <h2>Quarterfinals</h2>
          <div className="bracket-matches">
            {qfMatches.map((match) => (
              <PickemsBracketMatch
                key={match.slot}
                slot={match.slot}
                players={[match.player1, match.player2]}
                picked={qfPicks[match.slot]}
                onPick={(player) => pickQF(match.slot, player)}
              />
            ))}
          </div>
        </div>

        <div className="bracket-column bracket-semifinals">
          <h2>Semifinals</h2>
          <div className="bracket-matches">
            <PickemsBracketMatch
              slot="SF1"
              players={sf1Players.length === 2 ? sf1Players : ['Winner QF1', 'Winner QF2']}
              picked={sfPicks.SF1}
              disabled={sf1Players.length < 2}
              onPick={(player) => pickSF('SF1', player)}
            />

            <PickemsBracketMatch
              slot="SF2"
              players={sf2Players.length === 2 ? sf2Players : ['Winner QF3', 'Winner QF4']}
              picked={sfPicks.SF2}
              disabled={sf2Players.length < 2}
              onPick={(player) => pickSF('SF2', player)}
            />
          </div>
        </div>

        <div className="bracket-column bracket-grand-finals">
          <h2>Grand Finals</h2>
          <div className="bracket-matches">
            <PickemsBracketMatch
              slot="GF"
              players={gfPlayers.length === 2 ? gfPlayers : ['Winner SF1', 'Winner SF2']}
              picked={champion}
              disabled={gfPlayers.length < 2}
              onPick={setChampion}
            />
          </div>
        </div>
      </section>

      {finished && (
        <article className="card pickems-report">
          <h2>Your Playoff Picks:</h2>

          <div className="report-grid">
            <div className="report-group">
              <h3>Quarterfinals</h3>
              <p>QF1: {qfPicks.QF1}</p>
              <p>QF2: {qfPicks.QF2}</p>
              <p>QF3: {qfPicks.QF3}</p>
              <p>QF4: {qfPicks.QF4}</p>
            </div>

            <div className="report-group">
              <h3>Semifinals</h3>
              <p>SF1: {sfPicks.SF1}</p>
              <p>SF2: {sfPicks.SF2}</p>
            </div>

            <div className="report-group">
              <h3>Champion</h3>
              <p>{champion}</p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

function PickemsBracketMatch({ slot, players, picked, onPick, disabled = false }) {
  return (
    <div className={`bracket-match ${disabled ? 'disabled-match' : ''}`}>
      <div className="match-label">{slot}</div>

      {players.map((player) => (
        <button
          key={player}
          className={`pickems-bracket-player ${picked === player ? 'selected' : ''}`}
          onClick={() => !disabled && onPick(player)}
          disabled={disabled}
        >
          {picked === player ? `✓ ${player}` : player}
        </button>
      ))}

      <div className="match-result">
        {picked ? `Winner: ${picked}` : disabled ? 'Pick previous round first' : 'Pick a winner'}
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
