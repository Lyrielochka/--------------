import React from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import './video-gallery.css';

const videos = [
  { id: 'minaev', title: '1944: высадка в Нормандии и операция «Багратион»', author: 'МИНАЕВ LIVE', url: 'https://www.youtube.com/watch?v=4wAaPdAIj1M&t=1880s', note: 'Об операции — с 31:20', type: 'Уроки истории' },
  { id: 'history-lab', title: 'Вторая мировая война. Операция «Багратион»', author: 'History Lab', url: 'https://www.youtube.com/watch?v=lILswn9MlaM', note: 'Документальный фильм', type: 'Историческая хроника' },
  { id: 'great-war', title: 'Великая война. Операция «Багратион»', author: 'StarMedia / Babich-Design', url: 'https://www.youtube.com/watch?v=ppCUHPgugiE', note: '11-я серия цикла', type: 'Документальный цикл' },
];

export default function VideoGallery() {
  return <section className="bagration-videos section" id="videos" aria-labelledby="videos-title">
    <div className="bagration-videos-heading">
      <span className="section-kicker">СМОТРЕТЬ И ПОНИМАТЬ</span>
      <h2 id="videos-title">БОЛЬШЕ <em>ОБ ОПЕРАЦИИ</em></h2>
      <p>Три взгляда на наступление, изменившее ход войны.</p>
    </div>
    <div className="bagration-video-grid">
      {videos.map(video => <article className="bagration-video-card" key={video.id}>
        <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Смотреть на YouTube: ${video.title}`}>
          <div className="bagration-video-cover">
            <img decoding="async" src={`/assets/videos/${video.id}.jpg`} alt={`Обложка видео «${video.title}»`} loading="lazy" width="640" height="360" />
            <span className="bagration-video-kind">{video.type}</span>
            <span className="bagration-video-play"><Play size={25} fill="currentColor" strokeWidth={0}/></span>
            <span className="bagration-video-watch">СМОТРЕТЬ <ArrowUpRight size={15}/></span>
          </div>
          <h3>{video.title}</h3>
        </a>
        <p className="bagration-video-author">Автор: {video.author}</p>
        <span className="bagration-video-note">{video.note}</span>
      </article>)}
    </div>
  </section>;
}
