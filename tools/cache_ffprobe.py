#!/usr/bin/env python3
"""Consulta metadados de arquivos selecionados com cache local; nao altera midias."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys


def parse_args():
    ap = argparse.ArgumentParser(description='ffprobe incremental para midias especificas')
    ap.add_argument('--root', type=Path, default=Path.cwd(), help='raiz do cliprush-editor')
    ap.add_argument('--file', action='append', required=True, help='caminho de midia relativo a raiz (repita para varios)')
    ap.add_argument('--cache', type=Path, help='cache; padrao out/.cliprush-cache/ffprobe.json')
    return ap.parse_args()


def metadata(path):
    cmd = ['ffprobe', '-v', 'error', '-show_entries',
           'format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,r_frame_rate,channels,sample_rate',
           '-of', 'json', str(path)]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=45, check=False)
    if proc.returncode:
        raise RuntimeError((proc.stderr or proc.stdout).strip()[:500] or 'ffprobe retornou erro')
    raw = json.loads(proc.stdout)
    fmt = raw.get('format', {})
    streams = raw.get('streams', [])
    videos = [s for s in streams if s.get('codec_type') == 'video']
    audios = [s for s in streams if s.get('codec_type') == 'audio']
    primary = videos[0] if videos else {}
    return {
        'duration_s': round(float(fmt['duration']), 3) if fmt.get('duration') else None,
        'width': primary.get('width'), 'height': primary.get('height'),
        'fps': primary.get('avg_frame_rate') or primary.get('r_frame_rate'),
        'video_codec': primary.get('codec_name'),
        'audio_codec': audios[0].get('codec_name') if audios else None,
        'has_audio': bool(audios),
    }


def main():
    args = parse_args()
    root = args.root.resolve()
    cache_path = (args.cache or (root/'out'/'.cliprush-cache'/'ffprobe.json')).resolve()
    if not cache_path.is_relative_to(root):
        raise SystemExit('Cache deve ficar dentro do projeto.')
    if len(args.file) > 30:
        raise SystemExit('Escolha no maximo 30 arquivos por chamada; evite varreduras.')
    cache = {'schema': 1, 'files': {}}
    if cache_path.is_file():
        try:
            obj = json.loads(cache_path.read_text(encoding='utf-8'))
            if isinstance(obj, dict) and obj.get('schema') == 1 and isinstance(obj.get('files'), dict):
                cache = obj
        except (ValueError, OSError):
            pass
    output = []
    dirty = False
    for f in args.file:
        p = (root / f).resolve()
        if not p.is_relative_to(root) or not p.is_file():
            raise SystemExit(f'Arquivo inexistente ou fora do projeto: {f}')
        key = p.relative_to(root).as_posix()
        stat = p.stat()
        stamp = {'size': stat.st_size, 'mtime_ns': stat.st_mtime_ns}
        old = cache['files'].get(key, {})
        if old.get('stamp') == stamp and isinstance(old.get('data'), dict):
            data = old['data']; source = 'cache'
        else:
            try:
                data = metadata(p)
            except (subprocess.TimeoutExpired, FileNotFoundError, RuntimeError, ValueError, json.JSONDecodeError) as e:
                raise SystemExit(f'Falha ao analisar {key}: {e}')
            cache['files'][key] = {'stamp': stamp, 'data': data}
            dirty = True
            source = 'ffprobe'
        output.append({'arquivo': key, 'origem': source, **data})
    if dirty:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = cache_path.with_suffix('.tmp')
        temp_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding='utf-8')
        os.replace(temp_path, cache_path)
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
