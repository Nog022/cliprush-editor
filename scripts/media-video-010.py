"""Create clean, silent editing copies. Keep all original media intact."""
from pathlib import Path
import subprocess
P = Path('public/videos/video-010')
E = P/'edit'
E.mkdir(exist_ok=True)
V = P/'videos-complementar'
clips = [
    ('rdr-nature', 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4', 12.0, 4.5),
    ('rdr-bison', 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4', 36.8, 3.0),
    ('rdr-river', 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4', 22.0, 4.7),
    ('rdr-dogs', 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4', 43.0, 2.5),
    ('rdr-swamp', 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4', 34.0, 2.6),
    ('gta-wetlands', 'Trailer 1 GTA VI.mp4', 19.45, 1.3),
    ('gta-flamingos', 'Trailer 1 GTA VI.mp4', 20.78, 1.12),
    ('gta-dolphins', 'Trailer 1 GTA VI.mp4', 10.88, 2.15),
    ('gta-gator', 'Trailer 1 GTA VI.mp4', 42.32, 1.45),
    ('gta-store', 'Trailer 1 GTA VI.mp4', 47.95, 1.30),
    ('gta-coast', 'Trailer 2 GTA VI.mp4', 7.3, 2.7),
    ('gta-beach', 'Trailer 1 GTA VI.mp4', 13.0, 2.35),
]
for name, src, start, duration in clips:
    target = E/f'{name}.mp4'
    if not target.exists():
        subprocess.run(['ffmpeg','-v','fatal','-ss',str(start),'-i',str(V/src),'-t',str(duration),'-an','-vf','scale=1440:-2,fps=30','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-n',str(target)], check=True)
    thumb = E/f'{name}.jpg'
    if not thumb.exists():
        subprocess.run(['ffmpeg','-v','fatal','-i',str(target),'-frames:v','1','-n',str(thumb)],check=True)
    print(name, flush=True)
