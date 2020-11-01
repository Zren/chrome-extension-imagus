#!/usr/bin/env python3

import os
import re
import subprocess
import zipfile
from glob import glob
from urllib.request import urlretrieve
from mimetypes import guess_type as mime_type
from shutil import rmtree as rmt, copytree, copy, move, which

osp = os.path
pj = osp.join

os.chdir(osp.split(osp.abspath(__file__))[0])


def rmtree(path):
    if osp.exists(path):
        rmt(path)


def mkdirs(path):
    try: os.makedirs(path)
    finally: return osp.exists(path)


app_dir = osp.abspath('./src')

app = {
    'name': 'Imagus',
    'url': 'https://www.reddit.com/r/imagus/',
    'version': '0.9.8.74'
}

browsers = {
    "crx": {
        "manifest": "manifest.json",
        "locales": "_locales",
        "file_ext": ".crx"
    }
}

if not which('java'):
    raise SystemExit('java must be installed for minification!');

minifiers = {
    'closure-compiler': {
        'file': 'closure-compiler-v20200224.jar',
        'url': 'https://dl.google.com/closure-compiler/compiler-20200224.zip',
    },
    'yuicompressor': {
        'file': 'yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar',
        'url': 'https://github.com/downloads/yui/yuicompressor/yuicompressor-2.4.7.zip',
    },
    'htmlcompressor': {
        'file': 'htmlcompressor-1.5.3.jar',
        'url': 'https://github.com/serg472/htmlcompressor/releases/download/1.5.3/htmlcompressor-1.5.3.jar',
    }
}

bin_dir = pj('./bin')

if not os.path.isdir(bin_dir):
    os.makedirs(bin_dir)

for minifier_name, minifier in minifiers.items():
    jar_path = pj(bin_dir, os.path.basename(minifier['file']))

    if os.path.isfile(jar_path):
        minifiers[minifier_name] = jar_path
        continue

    file_path = pj(bin_dir, os.path.basename(minifier['url']))
    print(minifier['url'] + '...')
    urlretrieve(minifier['url'], filename=file_path)

    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path) as zf:
            with open(jar_path, 'wb') as jf:
                jf.write(zf.read(minifier['file']))

        os.remove(file_path)

    if not os.path.isfile(jar_path):
        params['-min'] = False
        break

    minifiers[minifier_name] = jar_path

tmp_dir = osp.abspath('.tmp')

compress_js = 'WHITESPACE_ONLY' #SIMPLE_OPTIMIZATIONS
compress_css = True
compress_html = True
tmp_dir_js = osp.abspath('.tmp_js')

if compress_js:
    tmp_dir_js_min = osp.abspath('.tmp_js_min')

try:
    rmtree(tmp_dir)
    rmtree(tmp_dir_js)
    rmtree(tmp_dir_js_min)
except:
    pass

if not mkdirs(tmp_dir) or not mkdirs(tmp_dir_js) or compress_js and not mkdirs(tmp_dir_js_min):
    raise SystemExit("Temp directories couldn't be created!")

copy(pj(app_dir, 'includes', 'app.js'), pj(tmp_dir_js, 'app.js'))
copy(pj(app_dir, 'js', 'app_bg.js'), pj(tmp_dir_js, 'app_bg.js'))

tmp = ['background.html', 'options.html']

if compress_html:
    subprocess.call(
        [
            'java', '-jar', minifiers['htmlcompressor'],
            '--type', 'html',
            '--remove-quotes',
            '--simple-doctype',
            '--remove-style-attr',
            '--remove-script-attr',
            '--compress-css',
            '-o', tmp_dir
        ] + [pj(app_dir, x) for x in tmp]
    )
else:
    for i in tmp:
        copy(pj(app_dir, i), pj(tmp_dir, i))

if compress_css:
    tmp = [pj(app_dir, 'css'), pj(tmp_dir, 'css')]
    mkdirs(tmp[1])
    copy(pj(tmp[0], 'options.css'), tmp[1])
    copy(pj(tmp[0], 'sp_ddg.css'), tmp[1])
    tmp = [
        osp.relpath(pj(tmp[1], 'options.css'), '.'),
        osp.relpath(pj(tmp[0], 'options.css'), '.')
    ]
    subprocess.call([
        'java', '-jar', minifiers['yuicompressor'],
        '--charset', 'utf-8',
        '--type', 'css',
        '-o', tmp[0],
        tmp[1]
    ])
else:
    copytree(pj(app_dir, 'css'), pj(tmp_dir, 'css'), copy_function=copy)

if compress_js:
    import itertools

    tmp = pj(tmp_dir, 'includes', '')

    if mkdirs(tmp):
        subprocess.call([
            'java', '-jar', minifiers['closure-compiler'],
            '--charset=utf-8',
            '--warning_level=QUIET',
            '--strict_mode_input',
            '--language_in=ECMASCRIPT_NEXT',
            '--rewrite_polyfills=false',
            '--compilation_level=' + compress_js,
            '--js="' + pj(app_dir, 'includes', 'content.js') + '"',
            '--js_output_file="' + tmp + 'content.js"'
        ])

        subprocess.call(
            [
                'java', '-jar', minifiers['closure-compiler'],
                '--charset=utf-8',
                '--warning_level=QUIET',
                '--strict_mode_input',
                '--language_in=ECMASCRIPT_NEXT',
                '--rewrite_polyfills=false',
                '--compilation_level=' + compress_js,
                '--module_output_path_prefix', pj(tmp_dir_js_min, ''),
            ] +
            list(itertools.chain(
                *[['--js="' + pj(tmp_dir_js, x + '.js') + '"', '--module', x + ':1'] for x in ['app_bg', 'app']]
            ))
        )

        rmtree(tmp_dir_js)
        move(tmp_dir_js_min, tmp_dir_js)
    else:
        raise SystemExit('Failed to create folder!')

    tmp = pj(tmp_dir, 'js', '')

    if mkdirs(tmp):
        js_compress_list = ['background', 'options', 'SieveUI', 'sp_gim']

        subprocess.call(
            [
                'java', '-jar', minifiers['closure-compiler'],
                '--charset=utf-8',
                '--warning_level=QUIET',
                '--strict_mode_input',
                '--language_in=ECMASCRIPT_NEXT',
                '--rewrite_polyfills=false',
                '--compilation_level=' + compress_js,
                '--module_output_path_prefix', tmp
            ] +
            list(itertools.chain(
                *[['--js="' + pj(app_dir, 'js', x + '.js') + '"', '--module', x + ':1'] for x in js_compress_list]
            ))
        )

        try:
            # https://github.com/ampproject/amphtml/issues/22463
            os.remove(pj(tmp_dir, 'js', '$weak$.js'))
        except:
            pass
    else:
        raise SystemExit('Failed to create folder!')
else:
    copytree(pj(app_dir, 'includes'), pj(tmp_dir, 'includes'), copy_function=copy)
    copytree(pj(app_dir, 'js'), pj(tmp_dir, 'js'), copy_function=copy)


package_name = osp.abspath(app['name'].lower() + '-' + app['version'])

copy(pj(app_dir, 'icon.png'), pj(tmp_dir, 'icon.png'))
copy(pj(app_dir, 'icon-18.png'), pj(tmp_dir, 'icon-18.png'))

copy(pj(app_dir, 'defaults.jsn'), pj(tmp_dir, 'defaults.jsn'))
copy(pj(app_dir, 'locales.jsn'), pj(tmp_dir, 'locales.jsn'))
copy(pj(app_dir, 'sieve.jsn'), pj(tmp_dir, 'sieve.jsn'))


# Chrome
tmp = [
    pj(tmp_dir, browsers['crx']['locales']),
    pj(tmp_dir, browsers['crx']['manifest']),
    package_name + '.zip'
]

copytree(pj(app_dir, browsers['crx']['locales']), tmp[0], copy_function=copy)
copy(pj(app_dir, browsers['crx']['manifest']), tmp[1])
move(pj(tmp_dir_js, 'app.js'), pj(tmp_dir, 'includes', 'app.js'))
move(pj(tmp_dir_js, 'app_bg.js'), pj(tmp_dir, 'js', 'app_bg.js'))

with zipfile.ZipFile(tmp[2], 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(tmp_dir):
        for file in files:
            fn = pj(root, file)
            wargs = [fn, fn[len(tmp_dir):]]
            mime = mime_type(fn)[0]

            if mime and re.search(r'^image/(?!svg)', mime):
                wargs.append(zipfile.ZIP_STORED)

            z.write(*wargs)

rmtree(tmp[0])
os.remove(tmp[1])

print(package_name + '.zip')


try:
    rmtree(tmp_dir)
    rmtree(tmp_dir_js)
except:
    pass
