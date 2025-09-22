import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { department, ward } = await req.json();

    console.log(`Fetching budget data for department: ${department}, ward: ${ward}`);

    // Validate inputs
    if (!department) {
      return new Response(
        JSON.stringify({ error: 'Department is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build query with optional ward filter
    // ✅ FIX: Changed filter from 'account' to 'account_budget_a' to match the front-end's department selector
    let query = supabase
      .from('municipal_budget')
      .select('*')
      .eq('account_budget_a', department); // This is the fix.
    
    // Add ward filter if the `ward` column exists in your schema.
    // As per the schema you provided, the 'ward' column does not exist.
    // If you add it, you can uncomment this block.
    // if (ward && ward !== 'all') {
    //  query = query.eq('ward', ward);
    // }
    
    const { data: budgetData, error } = await query.order('used_amt', { ascending: false });

    if (error) {
      console.error('Error fetching budget data:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch budget data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform data to match expected format using account_budget_a with proper error handling
    const transformedData = budgetData?.map(item => {
      const amount = item.used_amt ? Number(item.used_amt) : 0;
      const validAmount = !isNaN(amount) ? amount : 0;
      
      return {
        id: item.id,
        category: item.account_budget_a || item.glcode || 'Unknown Category',
        amount: validAmount,
        ward: 0, // Not used but kept for compatibility with front-end interface
        year: new Date().getFullYear() // Default to current year
      };
    }) || [];

    // Filter out any items with 0 amounts or invalid data
    const validData = transformedData.filter(item => 
      item.amount > 0 && 
      item.category && 
      item.category !== 'Unknown Category'
    );
    
    console.log(`✅ Fetched ${validData.length} valid budget items.`);

    // Calculate summary statistics
    const totalBudget = validData.reduce((sum, item) => sum + item.amount, 0);
    const largestItem = validData[0]; // Already sorted by used_amt desc

    const response = {
      budgetData: validData,
      summary: {
        totalBudget: totalBudget || 0,
        largestCategory: largestItem ? {
          category: largestItem.category,
          amount: largestItem.amount
        } : null,
        yearOverYearChange: 0 // TODO: Calculate when we have historical data
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-budget function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
