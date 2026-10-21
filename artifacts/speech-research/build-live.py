import re, json
from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

source=Path(r'C:/Users/Егор/Downloads/Выступление Титовец Анастасии — Багратион и Мурвик — 8 минут.docx')
out=Path('Выступление Титовец Анастасии — Багратион и Мурвик — живая демонстрация.docx')
sections=json.loads(Path('artifacts/speech-research/live-content.json').read_text(encoding='utf-8'))

# Preserve the source document page format and its established timed-script structure.
d=Document(source)
body=d._element.body
for el in list(body):
 if el.tag!=qn('w:sectPr'): body.remove(el)
styles=d.styles
for name in ['Normal','Title','Heading 1','Heading 2']:
 st=styles[name];st.font.name='Calibri';st.font.color.rgb=RGBColor.from_string('111111')
 styles[name].paragraph_format.widow_control=True
styles['Normal'].font.size=Pt(12)
styles['Normal'].paragraph_format.line_spacing=1.12
styles['Normal'].paragraph_format.space_after=Pt(7)
styles['Title'].font.size=Pt(23)
styles['Title'].paragraph_format.space_after=Pt(8)
styles['Heading 1'].font.size=Pt(15)
styles['Heading 1'].paragraph_format.space_before=Pt(14)
styles['Heading 1'].paragraph_format.space_after=Pt(5)
styles['Heading 1'].paragraph_format.keep_with_next=True
for section in d.sections:
 section.top_margin=Cm(1.8);section.bottom_margin=Cm(1.8)
 section.left_margin=Cm(2);section.right_margin=Cm(2)
 for footer in [section.footer,section.header]:
  for para in footer.paragraphs: para.clear()
 foot=section.footer.paragraphs[0];foot.alignment=2
 r=foot.add_run('Титовец Анастасия  •  ');r.font.size=Pt(9);r.font.color.rgb=RGBColor.from_string('777777')
 fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');foot._p.append(fld)
d.add_paragraph('Выступление о сайте\nОперация Багратион и Мурвик',style='Title')
d.add_paragraph('Титовец Анастасия  |  Урицкая средняя школа')
p=d.add_paragraph('Живой рассказ с последовательным показом всего сайта')
p.runs[0].italic=True
p=d.add_paragraph('Ориентир — 8 минут, включая короткий вопрос жюри. Время зависит от темпа речи и длительности ответа помощника. Серые подсказки и раздел подготовки не читать вслух.')
for r in p.runs:r.font.size=Pt(10);r.font.color.rgb=RGBColor.from_string('666666')
for heading,timing,cue,paras in sections:
 d.add_paragraph(heading,style='Heading 1')
 p=d.add_paragraph(timing);p.paragraph_format.keep_with_next=True;p.paragraph_format.space_after=Pt(4)
 for r in p.runs:r.bold=True;r.font.size=Pt(10)
 p=d.add_paragraph('Показ. '+cue);p.paragraph_format.keep_with_next=True
 for r in p.runs:r.italic=True;r.font.size=Pt(10);r.font.color.rgb=RGBColor.from_string('707070')
 for text in paras:d.add_paragraph(text)
d.add_paragraph('Подготовка к выступлению',style='Heading 1').paragraph_format.page_break_before=True
prep=[
 'Не читать вслух. Маршрут следует расположению блоков: главный экран → вступление → подготовка → фронты → командующие → техника → лётчицы → партизаны → основная карта и региональный атлас → итоги → фотографии → видео → другие проекты. После этого открывается Мурвик, доступный с любой страницы, и показывается мобильный вид.',
 'Мы из Гомеля. Минская область демонстрируется как пример подробного регионального атласа; не представлять её как свой регион. Основной акцент выступления — устройство и возможности проекта, а не пересказ военных событий.',
 'Перед показом запустить сайт и Ollama, проверить нейросетевой ответ и начать новый диалог. Вопрос жюри заранее не заготовлять. Если подключён только резервный режим, честно назвать его. Пройти весь маршрут с секундомером: восемь минут — ориентир, длительный ответ или обсуждение увеличат время.',
 'У «Катюши» заранее проверить громкость. Запустить запись залпа на 3–4 секунды, в это время не говорить. Затем остановить звук и закрыть карточку. Во время репетиции проверить, что звук прекращается при закрытии.',
 'На вопрос жюри вместе с приглашением отведено около 40 секунд. Если ответ ещё готовится, можно продолжить: «Пока Мурвик отвечает, видно, что посетитель может сформулировать вопрос сам, а затем продолжить разговор». Не объявлять ответ правильным до проверки.',
 'Названия на кнопках помощника могут содержать белорусскую букву i: «Мурвiк». В речи произносится «Мурвик». Исторические рубежи основной карты обобщены: формулировка об охвате относится ко всем основным направлениям, а не к каждому бою и каждой воинской части.'
]
for text in prep:
 p=d.add_paragraph(text)
 for r in p.runs:r.font.size=Pt(10);r.font.color.rgb=RGBColor.from_string('666666')
# Remove inherited title borders and any page-style decoration.
for st in [styles['Title'],styles['Heading 1']]:
 pp=st._element.find(qn('w:pPr'))
 if pp is not None:
  for el in list(pp):
   if el.tag==qn('w:pBdr'):pp.remove(el)
d.save(out)
words=sum(len(re.findall(r'[\wЁёА-Яа-я]+(?:[—-][\wЁёА-Яа-я]+)*',text)) for *_,paras in sections for text in paras)
Path('artifacts/speech-research/live-verification-content.json').write_text(json.dumps({'sections':sections,'spoken_words':words,'output':str(out.resolve())},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'spoken_words':words,'output':str(out.resolve())},ensure_ascii=False))
