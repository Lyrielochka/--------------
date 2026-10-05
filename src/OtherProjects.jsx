import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './other-projects.css';

const projects = [
  { title: 'Первая мировая война на землях Беларуси', image: 'first-world-war', url: 'https://11wwbel.netlify.app/', domain: '11wwbel.netlify.app' },
  { title: 'Афганская война. 1979–1989', image: 'afghanistan', url: 'https://afgan79.netlify.app/', domain: 'afgan79.netlify.app' },
];

export default function OtherProjects() {
  return <section id="projects" className="other-projects section" aria-labelledby="projects-title">
    <header className="other-projects-heading">
      <h2 id="projects-title">ДРУГИЕ НАШИ ПРОЕКТЫ</h2>
      <p>Продолжайте изучать историю вместе с нами.</p>
    </header>
    <div className="other-projects-grid">
      {projects.map((project, index) => <a className="other-project-card" href={project.url} target="_blank" rel="noopener noreferrer" key={project.image}>
        <div className="other-project-preview">
          <img decoding="async" src={`/assets/projects/${project.image}.webp`} alt={`Главная страница проекта «${project.title}»`} loading="lazy" width="1200" height="675" />
          <span className="other-project-number">ПРОЕКТ {index + 1}</span>
          <span className="other-project-arrow" aria-hidden="true"><ArrowUpRight size={24}/></span>
        </div>
        <div className="other-project-caption"><h3>{project.title}</h3><span>{project.domain}</span></div>
      </a>)}
    </div>
  </section>;
}
