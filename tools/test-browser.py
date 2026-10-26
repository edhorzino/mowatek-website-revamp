#!/usr/bin/env python3
"""Browser tests (Playwright + Chromium): layouts at 3 viewports, nav, form states, gallery. Needs `node tools/serve.mjs 8080 --mock-form`; enquiries are simulated."""
import sys, json, os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('MOWATEK_TEST_URL','http://localhost:8080'); OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'test-output'); os.makedirs(OUT,exist_ok=True)
PAGES=['','about/','services/','water-treatment/','wastewater-effluent-treatment/','consulting/','training/','procurement-maintenance/','projects/','faq/','contact/','privacy/','nonexistent/']
VIEWS={'desktop':(1440,900),'tablet':(820,1100),'mobile':(390,844)}
res=[]; fails=[]
def ok(name,cond,info=''):
    res.append((name,cond,info)); print(('PASS ' if cond else 'FAIL ')+name+(f'  [{info}]' if info else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b=p.chromium.launch()
    for vn,(w,h) in VIEWS.items():
        ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page(); errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
        for path in PAGES:
            if path=='nonexistent/': errs.clear()  # a 404 navigation logs a resource error by design
            r=pg.goto(f'{BASE}/{path}',wait_until='load'); pg.wait_for_timeout(250)
            st=r.status; exp=404 if path=='nonexistent/' else 200
            ov=pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            broken=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)")
            ok(f'{vn} /{path} status {exp}, no h-scroll, no broken imgs', st==exp and ov<=0 and not broken, f'status={st} overflow={ov} broken={broken[:2]}')
            if path in ('','water-treatment/','contact/','projects/') : pg.screenshot(path=f'{OUT}/{vn}-{path.strip("/") or "home"}.png',full_page=True)
        errs=[e for e in errs if '404' not in e]; ok(f'{vn} no console errors',not errs,'; '.join(errs[:3]))
        ctx.close()
    # ---- nav behaviour (mobile + desktop)
    ctx=b.new_context(viewport={'width':390,'height':844}); pg=ctx.new_page(); pg.goto(BASE+'/')
    pg.click('#menuBtn'); pg.wait_for_timeout(450); ok('mobile menu opens', pg.get_attribute('#menuBtn','aria-expanded')=='true' and pg.is_visible('#siteNav a[href$="about/"]'))
    pg.click('#siteNav .sub-toggle'); pg.wait_for_timeout(200); ok('mobile services submenu expands', pg.is_visible('#subServices a'))
    pg.click('#subServices a[href$="consulting/"]'); pg.wait_for_url('**/consulting/'); ok('mobile submenu link navigates', pg.url.endswith('/consulting/'))
    ctx.close()
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page(); pg.goto(BASE+'/')
    pg.hover('.has-sub'); pg.wait_for_timeout(300); ok('desktop services dropdown on hover', pg.is_visible('#subServices a'))
    pg.goto(BASE+'/'); pg.focus('.sub-toggle'); pg.keyboard.press('Enter'); ok('dropdown keyboard toggle', pg.get_attribute('.sub-toggle','aria-expanded')=='true')
    # hero slideshow + marquee animate
    pg.goto(BASE+'/'); ok('hero slides present (4)', pg.locator('.slide').count()==4)
    ok('partner marquee animates', 'scroll' in pg.evaluate("getComputedStyle(document.querySelector('.marquee-track')).animationName"))
    ok('partner links external+safe', pg.evaluate("[...document.querySelectorAll('.marquee-group:not([aria-hidden]) .partner')].every(a=>a.rel.includes('noopener')&&a.target==='_blank')"))
    ok('partners: jetincorp.com & nov.com', pg.evaluate("[...document.querySelectorAll('.partner')].some(a=>a.href.startsWith('https://jetincorp.com'))&&[...document.querySelectorAll('.partner')].some(a=>a.href.startsWith('https://www.nov.com'))"))
    ok('19 client logos and manual carousel controls', pg.locator('#client-track img').count()==19 and pg.is_visible('[data-client-next]') and pg.is_visible('[data-client-prev]'))
    # ---- gallery
    pg.goto(BASE+'/projects/'); n0=pg.locator('#gallery li:visible').count(); pg.click('[data-filter="water"]'); n1=pg.locator('#gallery li:visible').count()
    ok('gallery filter reduces items', 0<n1<n0, f'{n0}->{n1}')
    pg.click('#gallery li:visible a'); ok('lightbox opens', pg.evaluate("document.getElementById('lightbox').open")); pg.keyboard.press('ArrowRight'); pg.keyboard.press('Escape'); ok('lightbox closes on Escape', not pg.evaluate("document.getElementById('lightbox').open"))
    # ---- form states: only the local mock endpoint is used
    pg.goto(BASE+'/contact/?intent=quote&service=consulting'); pg.wait_for_timeout(200)
    ok('service preselected from URL', pg.input_value('#f-service')=='consulting')
    ok('quote intent heading', pg.inner_text('#form-title')=='Request a quote')
    pg.click('#submitBtn'); ok('empty form rejected', pg.locator('.err:visible').count()>=3)
    pg.fill('#f-name','Test User'); pg.fill('#f-org','Test Organisation'); pg.fill('#f-email','reject@example.com')
    pg.select_option('#f-service','water-treatment'); pg.fill('#f-message','Local mock enquiry only. No real email.'); pg.wait_for_timeout(3200)
    pg.click('#submitBtn'); pg.wait_for_selector('#form-error:visible')
    ok('provider failure retains enquiry and shows email fallback', pg.input_value('#f-name')=='Test User' and pg.locator('#form-error a[href="mailto:info@mowatek.com"]').count()>0 and not pg.is_visible('#form-success'))
    pg.fill('#f-email','nonjson@example.com'); pg.click('#submitBtn'); pg.wait_for_timeout(500)
    ok('HTTP 200 without JSON acceptance is not success', pg.is_visible('#form-error') and not pg.is_visible('#form-success'))
    pg.fill('#f-email','success@example.com'); pg.click('#submitBtn'); pg.wait_for_selector('#form-success:visible')
    ok('accepted email shows success and hides form', not pg.is_visible('#enquiryForm'))
    pg.click('#again'); ok('second enquiry preserves quote intent', pg.input_value('#f-intent')=='quote' and pg.input_value('#f-service')=='consulting' and pg.inner_text('#submitBtn')=='Request quote')
    ctx.close()
    # reduced motion
    ctx=b.new_context(reduced_motion='reduce'); pg=ctx.new_page(); pg.goto(BASE+'/'); ok('reduced motion: reveal content visible', pg.evaluate("getComputedStyle(document.querySelector('.reveal')).opacity")=='1' and pg.evaluate("getComputedStyle(document.querySelector('.slide.s2')).display")=='none'); ctx.close()
    b.close()
print(f'\n{len(res)-len(fails)}/{len(res)} browser checks passed'); json.dump(res,open(f'{OUT}/results.json','w'),indent=1)
sys.exit(1 if fails else 0)
