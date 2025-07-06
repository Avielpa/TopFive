import { useState, useEffect, useCallback, useMemo } from 'react';
import  api  from '../../services/api'; // ייבוא של הגדרות ה-API שלך

// הגדרת טיפוסים (Types) שיתאימו לנתונים מהשרת ולמצב המקומי
export type PlayerType = {
    id: number;
    name: string;
    pos: string;
    rating: number;
    role: 'STARTER' | 'BENCH' | 'RESERVE';
    minutes: number;
    offensive_role: 'PRIMARY' | 'SECONDARY' | 'ROLE' | 'DND';
};

export type TacticsType = {
    pace: number;
    offensiveFocus: number;
    defensiveAggressiveness: number;
    goToGuy: number | null;
    defensiveStopper: number | null;
};

type ApiDataType = TacticsType & {
    players: PlayerType[];
    teamColor: string;
};

export const useTeamTactics = () => {
    const [players, setPlayers] = useState<PlayerType[]>([]);
    const [tactics, setTactics] = useState<TacticsType>({
        pace: 3,
        offensiveFocus: 3,
        defensiveAggressiveness: 3,
        goToGuy: null,
        defensiveStopper: null,
    });
    const [teamColor, setTeamColor] = useState<string>('#FFA726'); // צבע ברירת מחדל
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // פונקציה לשליפת הנתונים מהשרת
    const fetchTactics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<ApiDataType>('/team/tactics/');
            const data = response.data;
            
            setPlayers(data.players);
            setTactics({
                pace: data.pace,
                offensiveFocus: data.offensiveFocus,
                defensiveAggressiveness: data.defensiveAggressiveness,
                goToGuy: data.goToGuy,
                defensiveStopper: data.defensiveStopper,
            });
            setTeamColor(data.teamColor);

        } catch (err) {
            console.error("Failed to fetch tactics:", err);
            setError("Could not load team data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // קריאה ראשונית לשרת בעת טעינת הקומפוננטה
    useEffect(() => {
        fetchTactics();
    }, [fetchTactics]);

    // פונקציה לשמירת השינויים בשרת
    const saveTactics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        // הכנת המידע לשליחה, תואם למבנה שהשרת מצפה לו
        const payload = {
            ...tactics,
            players: players.map(p => ({
                id: p.id,
                role: p.role,
                pos: p.pos,
                minutes: p.minutes,
                offensive_role: p.offensive_role,
            })),
        };

        try {
            await api.put('/team/tactics/', payload);
            // אופציונלי: הצגת הודעת הצלחה למשתמש
        } catch (err) {
            console.error("Failed to save tactics:", err);
            setError("Failed to save changes. Please check your connection and try again.");
            // חשוב: אם השמירה נכשלה, כדאי לשלוף מחדש את המידע המקורי מהשרת
            // כדי למנוע חוסר סינכרון.
            fetchTactics(); 
        } finally {
            setIsLoading(false);
        }
    }, [players, tactics, fetchTactics]);

    // חישובים ומיון של שחקנים, בדיוק כמו שעשינו קודם
    const totalMinutes = useMemo(() => players.reduce((sum, p) => sum + p.minutes, 0), [players]);
    const remainingMinutes = 240 - totalMinutes;
    const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

    const starters = useMemo(() => players.filter(p => p.role === 'STARTER').sort((a, b) => POSITIONS.indexOf(a.pos) - POSITIONS.indexOf(b.pos)), [players]);
    const bench = useMemo(() => players.filter(p => p.role === 'BENCH').sort((a, b) => b.rating - a.rating), [players]);
    const reserves = useMemo(() => players.filter(p => p.role === 'RESERVE').sort((a, b) => b.rating - a.rating), [players]);

    return {
        // State
        players,
        tactics,
        teamColor,
        isLoading,
        error,
        
        // State Setters
        setPlayers,
        setTactics,

        // Derived State
        starters,
        bench,
        reserves,
        totalMinutes,
        remainingMinutes,

        // Functions
        saveTactics,
    };
};
