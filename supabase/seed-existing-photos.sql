insert into public.photos (title, alt, image_path, public_url, category_id, sort_order)
values
  (
    'Manos esquila',
    'Manos esquila',
    'legacy/14a2GxvUI-Ql7K0ig5b1uR5LEWFhhAP-q',
    'https://drive.google.com/thumbnail?id=14a2GxvUI-Ql7K0ig5b1uR5LEWFhhAP-q&sz=w1200',
    (select id from public.categories where slug = 'retratos'),
    10
  ),
  (
    'Naturaleza',
    'Naturaleza',
    'legacy/1azEREVOQKiBhNWfI-QzHz3HwM0ceNtgQ',
    'https://drive.google.com/thumbnail?id=1azEREVOQKiBhNWfI-QzHz3HwM0ceNtgQ&sz=w1200',
    (select id from public.categories where slug = 'naturaleza'),
    20
  ),
  (
    'Arquitectura urbana',
    'Arquitectura urbana',
    'legacy/1t9vmLtedkdjrEZsVHFhzbRrsIC7Qy_Xw',
    'https://drive.google.com/thumbnail?id=1t9vmLtedkdjrEZsVHFhzbRrsIC7Qy_Xw&sz=w1200',
    (select id from public.categories where slug = 'arquitectura'),
    30
  ),
  (
    'Arquitectura urbana',
    'Arquitectura urbana',
    'legacy/1WKzzt_33sjXmWdIf7_MTjiUpVu8osa9r',
    'https://drive.google.com/thumbnail?id=1WKzzt_33sjXmWdIf7_MTjiUpVu8osa9r&sz=w1200',
    (select id from public.categories where slug = 'arquitectura'),
    40
  ),
  (
    'Arquitectura urbana',
    'Arquitectura urbana',
    'legacy/1Lf-Vjm3e8G0ABJqmSoqHP8sCcRG-3ekb',
    'https://drive.google.com/thumbnail?id=1Lf-Vjm3e8G0ABJqmSoqHP8sCcRG-3ekb&sz=w1200',
    (select id from public.categories where slug = 'arquitectura'),
    50
  ),
  (
    'Arquitectura urbana',
    'Arquitectura urbana',
    'legacy/1Yz2_QoaXylb5j25H2qfbHkV9lzJuABde',
    'https://drive.google.com/thumbnail?id=1Yz2_QoaXylb5j25H2qfbHkV9lzJuABde&sz=w1200',
    (select id from public.categories where slug = 'arquitectura'),
    60
  ),
  (
    'Paisaje intervenida',
    'Paisaje intervenida',
    'legacy/107vK9WcQym2-RYuEhIb7W6rJWRKIocjh',
    'https://drive.google.com/thumbnail?id=107vK9WcQym2-RYuEhIb7W6rJWRKIocjh&sz=w1200',
    (select id from public.categories where slug = 'paisajes'),
    70
  ),
  (
    'Naturaleza',
    'Naturaleza',
    'legacy/1FIv3ScphFe-iAR0z1NwSdm_cJifVK8J1',
    'https://drive.google.com/thumbnail?id=1FIv3ScphFe-iAR0z1NwSdm_cJifVK8J1&sz=w1200',
    (select id from public.categories where slug = 'naturaleza'),
    80
  );

