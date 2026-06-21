export type Project = {
  id: string
  title: string
  subtitle: string
  image: string
  year: string
  tech: string[]
  summary: string
  highlights: { label: string; value: string }[]
  features: string[]
  code: string
}

export const projects: Project[] = [
  {
    id: 'wang-cultivator',
    title: 'Wang Cultivator',
    subtitle: 'Action RPG — Cultivation Systems',
    image: '/project-wang-cultivator.png',
    year: '2024',
    tech: ['Unreal Engine 5', 'C++', 'Gameplay Ability System', 'Niagara'],
    summary:
      'A wuxia-inspired action RPG built around a deep, data-driven cultivation progression system. I architected the core combat loop, the ability framework, and the spiritual-energy resource model from the ground up in C++.',
    highlights: [
      { label: 'Role', value: 'Lead Gameplay Engineer' },
      { label: 'Engine', value: 'Unreal Engine 5.4' },
      { label: 'Systems', value: 'GAS · Combat · AI' },
    ],
    features: [
      'Custom Gameplay Ability System wrapper exposing designer-friendly Blueprints',
      'Data-driven cultivation tiers with networked, replicated stats',
      'Frame-perfect combat with input buffering and cancel windows',
      'Niagara-driven spiritual energy VFX bound to gameplay tags',
    ],
    code: `// CultivationComponent.cpp — spiritual energy tick
void UCultivationComponent::AdvanceRealm(float DeltaQi)
{
    QiPool = FMath::Clamp(QiPool + DeltaQi, 0.f, MaxQi);

    if (QiPool >= RealmThreshold && CanBreakthrough())
    {
        const ECultRealm Next = static_cast<ECultRealm>(
            static_cast<uint8>(CurrentRealm) + 1);

        ServerBreakthrough(Next);              // replicated
        OnRealmAdvanced.Broadcast(Next);       // VFX + UI hook
        UE_LOG(LogCultivation, Display,
            TEXT("Breakthrough -> %s"), *UEnum::GetValueAsString(Next));
    }
}`,
  },
  {
    id: 'run-and-bank',
    title: 'Run & Bank',
    subtitle: 'Hyper-Casual Endless Runner',
    image: '/project-run-and-bank.png',
    year: '2023',
    tech: ['Unreal Engine 5', 'Lua', 'Procedural Gen', 'Mobile'],
    summary:
      'A fast-paced mobile endless runner where players collect and bank currency under pressure. I built the procedural track generator and exposed the entire economy and difficulty curve to a hot-reloadable Lua scripting layer.',
    highlights: [
      { label: 'Role', value: 'Technical Developer' },
      { label: 'Platform', value: 'iOS · Android' },
      { label: 'Scripting', value: 'Embedded Lua VM' },
    ],
    features: [
      'Seamless procedural track streaming with object pooling',
      'Hot-reloadable Lua tuning for economy and difficulty',
      '60fps on mid-tier mobile via aggressive draw-call batching',
      'Deterministic seeded runs for daily challenges',
    ],
    code: `-- difficulty.lua — hot-reloadable tuning curve
local Difficulty = {}

function Difficulty.speed_for(distance)
    local base   = 8.0
    local ramp   = math.log(distance + 1) * 0.65
    local capped = math.min(base + ramp, 22.0)
    return capped
end

function Difficulty.spawn_weight(distance)
    return {
        coin     = 1.0,
        obstacle = math.min(0.15 + distance / 5000, 0.6),
        vault    = distance > 1200 and 0.08 or 0.0,
    }
end

return Difficulty`,
  },
]
