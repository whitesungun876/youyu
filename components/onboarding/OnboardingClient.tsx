"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "./StepShell";
import { ChoiceChips } from "./ChoiceChips";
import { RangeOptionalInput } from "./RangeOptionalInput";
import { saveUserDefined } from "@/lib/storage";
import type { Tightness, UserDefined } from "@/types/compass";

// ✅ 默认偏好
const DEFAULT_TIGHTNESS: Tightness = "ok";

type Step = 0 | 1 | 2 | 3 | 4;

type SafetyLevel = "tight" | "stable" | "safe";
type LifeLevel = "restrained" | "balanced" | "loose";

function mapSafety(level: SafetyLevel): { min: number; max: number } {
  // 你可以后续在 PRD 里调参，这里给 Phase1 合理默认
  if (level === "tight") return { min: 5000, max: 15000 };
  if (level === "stable") return { min: 15000, max: 40000 };
  return { min: 40000, max: 100000 };
}

function mapSpend(level: LifeLevel): { min: number; max: number } {
  if (level === "restrained") return { min: 3000, max: 6000 };
  if (level === "balanced") return { min: 6000, max: 10000 };
  return { min: 10000, max: 18000 };
}

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);

  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>("stable");
  const [lifeLevel, setLifeLevel] = useState<LifeLevel>("balanced");

  const [safetyRange, setSafetyRange] = useState<{ min: number; max: number } | null>(null);
  const [spendRange, setSpendRange] = useState<{ min: number; max: number } | null>(null);

  const [dreamText, setDreamText] = useState('');
  const [milestoneName, setMilestoneName] = useState('第一个 500');
  const [milestoneAmount, setMilestoneAmount] = useState(500);

  const computedSafety = useMemo(() => safetyRange ?? mapSafety(safetyLevel), [safetyRange, safetyLevel]);
  const computedSpend = useMemo(() => spendRange ?? mapSpend(lifeLevel), [spendRange, lifeLevel]);

  function next() {
    setStep((s) => Math.min(4, s + 1) as Step);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  function finish() {
    // Phase 1：先写死默认值（工程验证用）
    const incomeMin = 0;
    const incomeMax = 0;
    const fixedMin = 0;
    const fixedMax = 0;
    const saveMin = 0;
    const saveMax = 0;

    const payload: UserDefined = {
      safetyNetMin: computedSafety.min,
      safetyNetMax: computedSafety.max,
      monthlySpendMin: computedSpend.min,
      monthlySpendMax: computedSpend.max,
      dreamText: dreamText.trim() || '一个更舒服的生活节奏',

      milestoneName: milestoneName ?? '第一张机票',
      milestoneAmount: milestoneAmount ?? 500,
      milestoneSaved: 0,

      tightness: "ok",
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),

      monthlyIncomeMin: incomeMin ?? 0,
      monthlyIncomeMax: incomeMax ?? 0,
      fixedCostMin: fixedMin ?? 0,
      fixedCostMax: fixedMax ?? 0,
      presetSaveMin: saveMin ?? 0,
      presetSaveMax: saveMax ?? 0,
    };

    saveUserDefined(payload);
    router.push("/dashboard");
  }

    return (
    <main className="min-h-screen bg-yy-bg">
      <div className="mx-auto max-w-2xl px-5 py-10 space-y-5">
        <header className="space-y-2">
          <p className="text-xs text-yy-muted">{'🌙 友余 · Phase 1'}</p>
          <h1 className="text-2xl font-semibold text-yy-text">{'一次温柔的生活盘点仪式'}</h1>
          <p className="text-sm text-yy-muted">{'不评判，不催促。我们只把现状看清楚一点点。'}</p>
        </header>

        {step === 0 && (
          <StepShell
            title={'🔒 你的数据，只属于你'}
            subtitle={'你填写的一切都只保存在你的浏览器本地（localStorage）。我们看不到，也不会上传或分析。你随时可以一键重置，抹掉所有记录。'}
          >
            <button
              onClick={next}
              className="w-full rounded-2xl bg-white border border-yy-line py-3 text-sm"
            >
              {'我明白了'}
            </button>
          </StepShell>
        )}

        {step === 1 && (
      <StepShell
            title={'我们是来做什么的？'}
            subtitle={'这里不教你"该怎么做"，也不评判你做得好不好。我们只是一起，把现状放在一张地图上。'}
          >
            <div className="space-y-3 text-sm text-yy-muted leading-relaxed">
              <p>{'如果你：对钱有点焦虑、想更清晰但不想被审判、想慢慢对齐生活节奏——这里就是为你准备的。'}</p>
              <p>{'你会得到：一个温柔的节奏看板、一个不评判的对话伙伴、以及一张属于你的生活地图。'}</p>
          </div>

            <div className="mt-5 flex gap-2">
              <button onClick={back} className="rounded-2xl border border-yy-line bg-white/60 px-4 py-3 text-sm">
                {'返回'}
              </button>
              <button onClick={next} className="flex-1 rounded-2xl border border-yy-line bg-white px-4 py-3 text-sm">
                {'好，我们开始轻轻盘点'}
              </button>
        </div>
      </StepShell>
        )}

        {step === 2 && (
      <StepShell
            title={'🌱 安全垫 · 给自己一点底气'}
            subtitle={'即使明天想停下来喘口气，这笔钱也能让你体面地生活一阵子。你可以写得很粗略，甚至跳过。'}
          >
            <ChoiceChips
              value={safetyLevel}
              onChange={setSafetyLevel}
              options={[
                { key: "tight", label: '有点紧', hint: '先把呼吸稳住' },
                { key: "stable", label: '还算稳定', hint: '能撑住日常' },
                { key: "safe", label: '比较安心', hint: '底气更足' },
              ]}
            />

            <RangeOptionalInput
              label={'（可选）如果你愿意，也可以填一个大概范围'}
              helper={'例如：15k–25k。留空也完全可以。'}
              placeholder={'例如：15k-25k'}
              onValidRange={setSafetyRange}
            />

            <div className="mt-5 flex gap-2">
              <button onClick={back} className="rounded-2xl border border-yy-line bg-white/60 px-4 py-3 text-sm">
                {'返回'}
              </button>
              <button onClick={next} className="flex-1 rounded-2xl border border-yy-line bg-white px-4 py-3 text-sm">
                {'继续'}
              </button>
        </div>
      </StepShell>
        )}

        {step === 3 && (
      <StepShell
            title={'☕ 生活圈 · 快乐的日常'}
            subtitle={'不用省得太辛苦，我们只是想把钱花在真正重要的地方。你可以选一个感觉，或填范围。'}
          >
            <ChoiceChips
              value={lifeLevel}
              onChange={setLifeLevel}
              options={[
                { key: "restrained", label: '比较克制', hint: '偏稳' },
                { key: "balanced", label: '还算平衡', hint: '刚好' },
                { key: "loose", label: '有点放纵', hint: '犒赏多一些' },
              ]}
            />

            <RangeOptionalInput
              label={'（可选）月支出范围'}
              helper={'例如：6k–10k。留空也可以。'}
              placeholder={'例如：6000-10000'}
              onValidRange={setSpendRange}
            />

            <div className="mt-5 flex gap-2">
              <button onClick={back} className="rounded-2xl border border-yy-line bg-white/60 px-4 py-3 text-sm">
                {'返回'}
              </button>
              <button onClick={next} className="flex-1 rounded-2xl border border-yy-line bg-white px-4 py-3 text-sm">
                {'继续'}
              </button>
        </div>
      </StepShell>
        )}

        {step === 4 && (
    <StepShell
            title={'✨ 梦想库 · 给未来的自己留一点'}
            subtitle={'我们不让你一上来面对大数字。先从"第一步"开始，比如第一张机票 / 第一次预订 / 第一个 500。'}
          >
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-yy-text">{'你现在最想完成的一件小事'}</div>
          <input
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  placeholder={'例如：去冰岛 / 存离职基金 / 攒首付'}
                  className="mt-2 w-full rounded-2xl border border-yy-line bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--yy-yellow))]"
          />
        </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-yy-text">{'微目标名字'}</div>
                  <input
                    value={milestoneName}
                    onChange={(e) => setMilestoneName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-yy-line bg-white/70 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-yy-text">{'微目标金额（可改）'}</div>
                  <input
                    type="number"
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(Number(e.target.value || 500))}
                    className="mt-2 w-full rounded-2xl border border-yy-line bg-white/70 px-4 py-3 text-sm outline-none"
                  />
                </div>
          </div>

              <div className="rounded-2xl border border-yy-line bg-white/50 p-4 text-sm text-yy-muted leading-relaxed">
                {'我们会用区间和松紧调节器呈现你的节奏：更诚实，也更不焦虑。'}
          </div>
        </div>

            <div className="mt-5 flex gap-2">
              <button onClick={back} className="rounded-2xl border border-yy-line bg-white/60 px-4 py-3 text-sm">
                {'返回'}
              </button>
              <button onClick={finish} className="flex-1 rounded-2xl border border-yy-line bg-white px-4 py-3 text-sm">
                {'开始我的生活地图'}
              </button>
            </div>

            <p className="mt-4 text-xs text-yy-muted">
              {'Phase 1 默认将数据保存在你的浏览器本地（localStorage）。清理缓存或换设备会丢失记录；未来会提供加密同步。'}
            </p>
          </StepShell>
        )}
      </div>
    </main>
  );
}
