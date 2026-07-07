/**
 * Конфиг хореографии персонажа.
 *
 * CLIP_QUEUE — порядок проигрывания клипов по именам из gltf.animations.
 * null означает «все клипы в порядке, в котором они лежат в файле».
 * Реальные имена логируются в консоль при загрузке модели
 * (см. useChoreography) — скопируй их сюда, чтобы задать свой порядок,
 * повторы допустимы, например:
 *
 *   export const CLIP_QUEUE: string[] | null = [
 *     'Walking', 'Kung_Fu_Punch', 'Walking', 'Backflip_and_Hooks',
 *   ]
 */
export const CLIP_QUEUE: string[] | null = null

/** Длительность перекрёстного перехода между клипами, сек. */
export const CROSSFADE_SECONDS = 0.4

/**
 * Прибить корень к месту по горизонтали (x/z), сохранив вертикаль (прыжки).
 * В клипах Meshy есть root motion — без этого персонаж убегает из кадра
 * и ломает композицию hero. false — вернуть перемещение по сцене.
 */
export const PIN_ROOT_XZ = true

/** URL модели (учитывает base path при деплое на GitHub Pages). */
export const MODEL_URL = `${import.meta.env.BASE_URL}models/character.glb`

/** Узкие экраны: статичная поза вместо живой анимации (батарея/перф). */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

/**
 * Глитч-эффект на модели (шейдерный, без постпроцессинга).
 * Редкие короткие всплески: сдвиг горизонтальных полос + RGB-расщепление.
 * chromaBase — постоянное едва заметное расщепление (маскирует артефакты
 * нормалей и между всплесками), chromaBurst — добавка в момент всплеска.
 */
export const GLITCH = {
  enabled: true,
  minIntervalS: 0.9, // пауза между всплесками, от/до
  maxIntervalS: 2.6,
  minDurationS: 0.12, // длительность всплеска, от/до
  maxDurationS: 0.38,
  chromaBase: 0.006,
  chromaBurst: 0.028,
  sliceUv: 0.06, // сила горизонтального разрыва текстуры во всплеск
}
